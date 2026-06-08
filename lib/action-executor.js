/**
 * Action Executor - Gate Middleware for X Actions
 * 
 * Phase 1: Action Gate for Real X Actions
 * 
 * This module acts as a central gate before executing any real X action.
 * - If ENABLE_REAL_ACTIONS != "1" → queue only, no real call
 * - If DRY_RUN_ONLY=1 → dry-run/queue only
 * - If MOCK_MODE=1 → dry-run/queue only
 * - To execute real: must pass real_callable and have action_id/audit
 */

const { isRealActionsEnabled, isMockMode, isDryRunOnly, checkActionGate } = require('./safety-config');
const { recordAudit, makeId } = require('./store');

/**
 * Execute or Queue an action based on safety configuration
 * @param {string} actionName - Name of the action (e.g., 'publish_post', 'send_dm')
 * @param {object} payload - Action payload data
 * @param {function} realCallable - Actual function to call if execution allowed
 * @param {object} options - Additional options
 * @returns {Promise<object>} Result with status and data
 */
async function executeOrQueue(actionName, payload, realCallable = null, options = {}) {
  const { env = null, auditAction = null, requireAudit = true } = options;
  
  // Check the action gate first
  const gate = checkActionGate(actionName, env);
  
  // Generate action ID for tracking
  const actionId = makeId(actionName);
  
  // Log to audit if required
  if (requireAudit && auditAction) {
    await recordAudit(auditAction, `Action "${actionName}" requested`, {
      actionId,
      actionName,
      payload: payload || {},
      blockedBy: gate.blockedBy,
      shouldExecute: gate.shouldExecute,
    });
  }
  
  // If gate blocks execution, return queued response
  if (!gate.shouldExecute) {
    return {
      ok: false,
      actionId,
      actionName,
      executed: false,
      queued: true,
      message: gate.reason,
      error: 'ACTION_BLOCKED_BY_SAFETY',
      safetyGate: {
        shouldExecute: gate.shouldExecute,
        blockedBy: gate.blockedBy,
        reason: gate.reason,
      },
    };
  }
  
  // Gate allows execution - check if realCallable provided
  if (!realCallable || typeof realCallable !== 'function') {
    return {
      ok: false,
      actionId,
      actionName,
      executed: false,
      message: `Action "${actionName}" ไม่มี realCallable สำหรับเรียกจริง`,
      error: 'NO_REAL_CALLABLE',
    };
  }
  
  try {
    // Execute the real action
    const result = await realCallable(payload);
    
    // Log successful execution
    if (requireAudit && auditAction) {
      await recordAudit(auditAction, `Action "${actionName}" สำเร็จ`, {
        actionId,
        actionName,
        executed: true,
        result: result || {},
      });
    }
    
    return {
      ok: true,
      actionId,
      actionName,
      executed: true,
      queued: false,
      message: `Action "${actionName}" สำเร็จ`,
      data: result,
    };
  } catch (error) {
    // Log execution error
    if (requireAudit && auditAction) {
      await recordAudit(auditAction, `Action "${actionName}" ล้มเหลว`, {
        actionId,
        actionName,
        executed: false,
        error: error.message || String(error),
      });
    }
    
    return {
      ok: false,
      actionId,
      actionName,
      executed: false,
      message: `Action "${actionName}" ล้มเหลว: ${error.message || String(error)}`,
      error: 'ACTION_EXECUTION_FAILED',
    };
  }
}

/**
 * Execute a publish post action with safety gate
 * @param {object} postData - Post data (text, media, etc.)
 * @param {function} realPublishFn - Real publish function
 * @returns {Promise<object>} Result
 */
async function executePublishPost(postData, realPublishFn = null) {
  return executeOrQueue(
    'publish_post',
    postData,
    realPublishFn,
    {
      auditAction: 'post.publish',
      requireAudit: true,
    }
  );
}

/**
 * Execute a delete post action with safety gate
 * @param {string} tweetId - Tweet ID to delete
 * @param {function} realDeleteFn - Real delete function
 * @returns {Promise<object>} Result
 */
async function executeDeletePost(tweetId, realDeleteFn = null) {
  return executeOrQueue(
    'delete_post',
    { tweetId },
    realDeleteFn,
    {
      auditAction: 'post.delete',
      requireAudit: true,
    }
  );
}

/**
 * Execute a like action with safety gate
 * @param {string} tweetId - Tweet ID to like
 * @param {function} realLikeFn - Real like function
 * @returns {Promise<object>} Result
 */
async function executeLike(tweetId, realLikeFn = null) {
  return executeOrQueue(
    'like_post',
    { tweetId },
    realLikeFn,
    {
      auditAction: 'post.like',
      requireAudit: true,
    }
  );
}

/**
 * Execute an unlike action with safety gate
 * @param {string} tweetId - Tweet ID to unlike
 * @param {function} realUnlikeFn - Real unlike function
 * @returns {Promise<object>} Result
 */
async function executeUnlike(tweetId, realUnlikeFn = null) {
  return executeOrQueue(
    'unlike_post',
    { tweetId },
    realUnlikeFn,
    {
      auditAction: 'post.unlike',
      requireAudit: true,
    }
  );
}

/**
 * Execute a retweet action with safety gate
 * @param {string} tweetId - Tweet ID to retweet
 * @param {function} realRetweetFn - Real retweet function
 * @returns {Promise<object>} Result
 */
async function executeRetweet(tweetId, realRetweetFn = null) {
  return executeOrQueue(
    'retweet_post',
    { tweetId },
    realRetweetFn,
    {
      auditAction: 'post.retweet',
      requireAudit: true,
    }
  );
}

/**
 * Execute an unretweet action with safety gate
 * @param {string} tweetId - Tweet ID to unretweet
 * @param {function} realUnretweetFn - Real unretweet function
 * @returns {Promise<object>} Result
 */
async function executeUnretweet(tweetId, realUnretweetFn = null) {
  return executeOrQueue(
    'unretweet_post',
    { tweetId },
    realUnretweetFn,
    {
      auditAction: 'post.unretweet',
      requireAudit: true,
    }
  );
}

/**
 * Execute a follow action with safety gate
 * @param {string} targetUserId - User ID to follow
 * @param {function} realFollowFn - Real follow function
 * @returns {Promise<object>} Result
 */
async function executeFollow(targetUserId, realFollowFn = null) {
  return executeOrQueue(
    'follow_user',
    { targetUserId },
    realFollowFn,
    {
      auditAction: 'user.follow',
      requireAudit: true,
    }
  );
}

/**
 * Execute an unfollow action with safety gate
 * @param {string} targetUserId - User ID to unfollow
 * @param {function} realUnfollowFn - Real unfollow function
 * @returns {Promise<object>} Result
 */
async function executeUnfollow(targetUserId, realUnfollowFn = null) {
  return executeOrQueue(
    'unfollow_user',
    { targetUserId },
    realUnfollowFn,
    {
      auditAction: 'user.unfollow',
      requireAudit: true,
    }
  );
}

/**
 * Execute a send DM action with safety gate
 * @param {object} dmData - DM data (recipient, text)
 * @param {function} realDmFn - Real DM function
 * @returns {Promise<object>} Result
 */
async function executeSendDM(dmData, realDmFn = null) {
  return executeOrQueue(
    'send_dm',
    dmData,
    realDmFn,
    {
      auditAction: 'dm.send',
      requireAudit: true,
    }
  );
}

/**
 * Execute a create list action with safety gate
 * @param {object} listData - List data (name, description, etc.)
 * @param {function} realListFn - Real create list function
 * @returns {Promise<object>} Result
 */
async function executeCreateList(listData, realListFn = null) {
  return executeOrQueue(
    'create_list',
    listData,
    realListFn,
    {
      auditAction: 'list.create',
      requireAudit: true,
    }
  );
}

/**
 * Execute an add list member action with safety gate
 * @param {object} memberData - List member data (listId, userId)
 * @param {function} realAddFn - Real add member function
 * @returns {Promise<object>} Result
 */
async function executeAddListMember(memberData, realAddFn = null) {
  return executeOrQueue(
    'add_list_member',
    memberData,
    realAddFn,
    {
      auditAction: 'list.member.add',
      requireAudit: true,
    }
  );
}

/**
 * Execute a remove list member action with safety gate
 * @param {object} memberData - List member data (listId, userId)
 * @param {function} realRemoveFn - Real remove member function
 * @returns {Promise<object>} Result
 */
async function executeRemoveListMember(memberData, realRemoveFn = null) {
  return executeOrQueue(
    'remove_list_member',
    memberData,
    realRemoveFn,
    {
      auditAction: 'list.member.remove',
      requireAudit: true,
    }
  );
}

/**
 * Execute a media upload action with safety gate
 * @param {object} mediaData - Media data (file path, type)
 * @param {function} realUploadFn - Real upload function
 * @returns {Promise<object>} Result
 */
async function executeMediaUpload(mediaData, realUploadFn = null) {
  return executeOrQueue(
    'upload_media',
    mediaData,
    realUploadFn,
    {
      auditAction: 'media.upload',
      requireAudit: true,
    }
  );
}

module.exports = {
  executeOrQueue,
  executePublishPost,
  executeDeletePost,
  executeLike,
  executeUnlike,
  executeRetweet,
  executeUnretweet,
  executeFollow,
  executeUnfollow,
  executeSendDM,
  executeCreateList,
  executeAddListMember,
  executeRemoveListMember,
  executeMediaUpload,
};
