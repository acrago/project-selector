import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardFooter,
  ClipboardCopy,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  TextArea,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  ArrowLeftIcon,
  CommentIcon,
  CommentsIcon,
  EllipsisVIcon,
  FileAltIcon,
  GitlabIcon,
  GlobeIcon,
  OutlinedCommentsIcon,
  PencilAltIcon,
  PlusCircleIcon,
  ReplyIcon,
  SyncAltIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useComments } from '../contexts/CommentContext';
import { useGitLabAuth } from '../contexts/GitLabAuthContext';
import {
  buildPromptForThread,
  buildPromptForThreads,
  fetchSummary,
  getCachedSummary,
  getCachedSummaryForThread,
  setCachedSummary,
  setCachedSummaryForThread,
  threadSignature,
  threadsToSignature,
} from '../services/summarizeService';
import { Comment, Thread } from '../types';
import { findElementBySelector } from '../utils/selectorUtils';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function renderSyncStatusLabel(
  status: Thread['syncStatus'],
  id: string,
): React.ReactNode {
  switch (status) {
    case 'synced':
      return (
        <Label id={`sync-label-${id}`} color="green" isCompact>
          Synced
        </Label>
      );
    case 'local':
      return (
        <Label id={`sync-label-${id}`} color="grey" isCompact>
          Local
        </Label>
      );
    case 'pending':
      return (
        <Label id={`sync-label-${id}`} color="blue" isCompact>
          Pending…
        </Label>
      );
    case 'syncing':
      return (
        <Label
          id={`sync-label-${id}`}
          color="blue"
          icon={<Spinner size="sm" />}
          isCompact
        >
          Syncing…
        </Label>
      );
    case 'error':
      return (
        <Label id={`sync-label-${id}`} color="red" isCompact>
          Sync error
        </Label>
      );
    default:
      return (
        <Label id={`sync-label-${id}`} color="grey" isCompact>
          Local
        </Label>
      );
  }
}

const ThreadListItem: React.FunctionComponent<{
  thread: Thread;
  isCurrentRoute: boolean;
  onSelect: () => void;
}> = ({ thread, isCurrentRoute, onSelect }) => {
  const latestComment = thread.comments[thread.comments.length - 1];
  const firstComment = thread.comments[0];
  const isClosed = thread.status === 'closed';

  return (
    <div
      id={`discussion-thread-${thread.id}`}
      role="button"
      tabIndex={0}
      data-discussion-thread-row
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--pf-t--global--border--color--default)',
        backgroundColor: isCurrentRoute
          ? 'var(--pf-t--global--background--color--primary--default)'
          : 'transparent',
        opacity: isClosed ? 0.6 : 1,
      }}
    >
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsXs' }}
      >
        <FlexItem>
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <Flex
                spaceItems={{ default: 'spaceItemsXs' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <FlexItem>
                  <Label
                    id={`route-label-${thread.id}`}
                    color={isCurrentRoute ? 'blue' : 'grey'}
                    isCompact
                  >
                    {thread.route}
                  </Label>
                </FlexItem>
                {isClosed && (
                  <FlexItem>
                    <Label id={`closed-label-${thread.id}`} color="grey" isCompact>
                      Closed
                    </Label>
                  </FlexItem>
                )}
                <FlexItem>
                  {renderSyncStatusLabel(thread.syncStatus, thread.id)}
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {latestComment ? timeAgo(latestComment.createdAt) : ''}
              </span>
            </FlexItem>
          </Flex>
        </FlexItem>

        {thread.elementDescription && (
          <FlexItem>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--pf-t--global--text--color--subtle)',
                fontFamily: 'var(--pf-t--global--font--family--mono)',
              }}
            >
              {thread.elementDescription}
            </span>
          </FlexItem>
        )}

        {firstComment && (
          <FlexItem>
            <span style={{ fontSize: '13px' }}>
              {firstComment.author && (
                <strong style={{ marginRight: '4px' }}>{firstComment.author}</strong>
              )}
              {firstComment.text.length > 100
                ? `${firstComment.text.substring(0, 100)}...`
                : firstComment.text}
            </span>
          </FlexItem>
        )}

        {thread.comments.length > 1 && (
          <FlexItem>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--pf-t--global--text--color--subtle)',
              }}
            >
              <CommentIcon style={{ marginRight: '4px' }} />
              {thread.comments.length} comment{thread.comments.length !== 1 ? 's' : ''}
            </span>
          </FlexItem>
        )}
      </Flex>
    </div>
  );
};

const REPLY_INDENT_PX = 32;

interface CommentCardProps {
  thread: Thread;
  comment: Comment;
  depth: number;
  getReplies: (parentId: string) => Comment[];
  isAuthenticated: boolean;
  user: { login: string } | null;
  editingCommentId: string | null;
  replyingToCommentId: string | null;
  editDraft: string;
  replyDraft: string;
  setEditingCommentId: (id: string | null) => void;
  setEditDraft: (text: string) => void;
  setReplyingToCommentId: (id: string | null) => void;
  setReplyDraft: (text: string) => void;
  onSaveEdit: (commentId: string) => void;
  onSubmitReplyToComment: (parentCommentId: string) => void;
  onDeleteComment: (threadId: string, commentId: string) => void;
}

const CommentCard: React.FunctionComponent<CommentCardProps> = (props) => {
  const {
    thread,
    comment,
    depth,
    getReplies,
    isAuthenticated,
    user,
    editingCommentId,
    replyingToCommentId,
    editDraft,
    replyDraft,
    setEditingCommentId,
    setEditDraft,
    setReplyingToCommentId,
    setReplyDraft,
    onSaveEdit,
    onSubmitReplyToComment,
    onDeleteComment,
  } = props;
  const nestedReplies = getReplies(comment.id);
  const isAuthor = comment.author === user?.login;
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const isNested = depth > 0;
  return (
    <>
      <div
        id={`comment-${comment.id}`}
        style={{
          padding: isNested ? `8px 16px 8px ${16 + depth * REPLY_INDENT_PX}px` : '8px 16px',
          borderBottom:
            '1px solid var(--pf-t--global--border--color--default)',
          ...(isNested && {
            borderLeft: '3px solid var(--pf-t--global--border--color--default)',
            marginLeft: '8px',
          }),
        }}
      >
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ marginBottom: '4px' }}
        >
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <strong style={{ fontSize: '13px' }}>
                {comment.author || 'Anonymous'}
              </strong>
              {comment.author && (
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                >
                  @{comment.author}
                </span>
              )}
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}
              >
                {timeAgo(comment.createdAt)}
              </span>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
            >
              <Tooltip content="Reply">
                <Button
                  id={`reply-comment-${thread.id}-${comment.id}`}
                  variant="plain"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setEditingCommentId(null);
                    setReplyingToCommentId(comment.id);
                    setReplyDraft('');
                  }}
                  aria-label="Reply to comment"
                  icon={<ReplyIcon />}
                  isDisabled={!isAuthenticated}
                />
              </Tooltip>
              {isAuthor && (
                <Tooltip content="Edit comment">
                  <Button
                    id={`edit-comment-${thread.id}-${comment.id}`}
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setReplyingToCommentId(null);
                      setEditingCommentId(comment.id);
                      setEditDraft(comment.text);
                    }}
                    aria-label="Edit comment"
                    icon={<PencilAltIcon />}
                    isDisabled={!isAuthenticated}
                  />
                </Tooltip>
              )}
              <Tooltip content="Delete comment in UI and GitLab">
                <Button
                  id={`delete-comment-${thread.id}-${comment.id}`}
                  variant="plain"
                  isDanger
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeleteComment(thread.id, comment.id);
                  }}
                  aria-label="Delete comment"
                  icon={<TrashIcon />}
                  isDisabled={!isAuthenticated}
                />
              </Tooltip>
            </Flex>
          </FlexItem>
        </Flex>
        {isEditing && !replyingToCommentId ? (
          <div
            data-comment-edit-form
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <TextArea
              id={`edit-input-${comment.id}`}
              value={editDraft}
              onChange={(_e, val) => setEditDraft(val)}
              aria-label="Edit comment"
              rows={3}
            />
            <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '8px' }}>
              <Button
                id={`save-edit-${comment.id}`}
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSaveEdit(comment.id);
                }}
                isDisabled={!editDraft.trim()}
              >
                Save
              </Button>
              <Button
                id={`cancel-edit-${comment.id}`}
                variant="link"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setEditingCommentId(null);
                  setEditDraft('');
                }}
              >
                Cancel
              </Button>
            </Flex>
          </div>
        ) : (
          <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
            {comment.text}
          </div>
        )}
        {isReplying && !editingCommentId && (
          <div
            data-comment-reply-inline
            style={{ marginTop: '8px' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <TextArea
              id={`reply-inline-${comment.id}`}
              value={replyDraft}
              onChange={(_e, val) => setReplyDraft(val)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.stopPropagation();
              }}
              placeholder="Write a reply... (Enter for new line)"
              aria-label="Reply"
              rows={2}
            />
            <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '4px' }}>
              <Button
                id={`submit-reply-inline-${comment.id}`}
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSubmitReplyToComment(comment.id);
                }}
                isDisabled={!replyDraft.trim()}
              >
                Reply
              </Button>
              <Button
                id={`cancel-reply-${comment.id}`}
                variant="link"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setReplyingToCommentId(null);
                  setReplyDraft('');
                }}
              >
                Cancel
              </Button>
            </Flex>
          </div>
        )}
      </div>
      {nestedReplies.map((reply) => (
        <CommentCard
          key={reply.id}
          {...props}
          comment={reply}
          depth={depth + 1}
        />
      ))}
    </>
  );
};

const ThreadDetailView: React.FunctionComponent<{
  thread: Thread;
  onBack: () => void;
  onSummarizeThread?: (thread: Thread) => void;
  summaryTitle?: string;
  summaryContent?: string;
  summaryLoading?: boolean;
  onCloseSummary?: () => void;
}> = ({ thread, onBack, onSummarizeThread, summaryTitle, summaryContent, summaryLoading, onCloseSummary }) => {
  const {
    addReply,
    closeThread,
    reopenThread,
    removePin,
    deleteComment,
    updateComment,
    addReplyToComment,
  } = useComments();
  const { isAuthenticated, login, user, devFakeLogin } = useGitLabAuth();
  const [replyText, setReplyText] = React.useState('');
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState('');
  const [replyingToCommentId, setReplyingToCommentId] = React.useState<string | null>(null);
  const [replyDraft, setReplyDraft] = React.useState('');
  const [elementFound, setElementFound] = React.useState<boolean | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = React.useState(false);
  const [summaryThreadExpanded, setSummaryThreadExpanded] = React.useState(false);
  const commentsEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (thread.cssSelector) {
      setElementFound(!!findElementBySelector(thread.cssSelector));
    } else {
      setElementFound(null);
    }
  }, [thread.cssSelector]);

  React.useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.comments.length]);

  // When viewing a new thread (no comments yet), focus the reply field so the user can type immediately
  React.useEffect(() => {
    if (thread.comments.length !== 0) return;
    const focusReply = () => {
      const el = document.getElementById(`reply-input-${thread.id}`);
      const textarea = el?.tagName === 'TEXTAREA' ? el : el?.querySelector('textarea');
      (textarea as HTMLTextAreaElement | null)?.focus();
    };
    const id = requestAnimationFrame(focusReply);
    return () => cancelAnimationFrame(id);
  }, [thread.id, thread.comments.length]);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    addReply(thread.id, replyText.trim());
    setReplyText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
  };

  const topLevelComments = React.useMemo(
    () => thread.comments.filter((c) => !c.parentCommentId),
    [thread.comments],
  );
  const getReplies = (parentId: string) =>
    thread.comments.filter((c) => c.parentCommentId === parentId);

  const handleSaveEdit = (commentId: string) => {
    if (!editDraft.trim()) return;
    updateComment(thread.id, commentId, editDraft.trim());
    setEditingCommentId(null);
    setEditDraft('');
  };

  const handleSubmitReplyToComment = (parentCommentId: string) => {
    if (!replyDraft.trim()) return;
    addReplyToComment(thread.id, parentCommentId, replyDraft.trim());
    setReplyingToCommentId(null);
    setReplyDraft('');
  };

  const commentCardProps: Omit<CommentCardProps, 'comment' | 'depth'> = {
    thread,
    getReplies,
    isAuthenticated,
    user: user ?? null,
    editingCommentId,
    replyingToCommentId,
    editDraft,
    replyDraft,
    setEditingCommentId,
    setEditDraft,
    setReplyingToCommentId,
    setReplyDraft,
    onSaveEdit: handleSaveEdit,
    onSubmitReplyToComment: handleSubmitReplyToComment,
    onDeleteComment: deleteComment,
  };

  return (
    <Flex
      direction={{ default: 'column' }}
      style={{
        height: '100%',
        width: '100%',
        minWidth: 0,
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      spaceItems={{ default: 'spaceItemsNone' }}
    >
      {/* Back to discussions banner */}
      <FlexItem>
        <Banner id="thread-detail-back-banner" screenReaderText="Back to discussions">
          <Button
            id="discussions-back-btn"
            variant="link"
            isInline
            icon={<ArrowLeftIcon />}
            iconPosition="start"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            aria-label="Back to discussions"
          >
            Back to discussions
          </Button>
        </Banner>
      </FlexItem>
      {/* Header */}
      <FlexItem style={{ flexShrink: 0 }}>
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
          }}
        >
          <FlexItem>
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
            >
              <FlexItem>
                <Label
                  id={`detail-route-label-${thread.id}`}
                  color="blue"
                  isCompact
                >
                  {thread.route}
                </Label>
              </FlexItem>
              {thread.elementDescription && (
                <FlexItem>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--pf-t--global--font--family--mono)',
                      color: 'var(--pf-t--global--text--color--subtle)',
                    }}
                  >
                    {thread.elementDescription}
                  </span>
                </FlexItem>
              )}
              <FlexItem>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                >
                  {thread.comments.length} comment
                  {thread.comments.length !== 1 ? 's' : ''}
                </span>
              </FlexItem>
              <FlexItem>
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsSm' }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--pf-t--global--text--color--subtle)',
                      fontWeight: 500,
                    }}
                  >
                    Status
                  </span>
                  {renderSyncStatusLabel(thread.syncStatus, `detail-${thread.id}`)}
                  {thread.issueUrl && (
                    <Tooltip content="View on GitLab">
                      <Button
                        id={`gitlab-link-${thread.id}`}
                        variant="link"
                        component="a"
                        href={thread.issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open in GitLab"
                        icon={<GitlabIcon />}
                        iconPosition="start"
                      >
                        {thread.issueNumber != null
                          ? `#${thread.issueNumber}`
                          : 'Issue pending...'}
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
              </FlexItem>
              {thread.cssSelector && elementFound === false && (
                <FlexItem>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--pf-t--global--color--status--danger--default)',
                    }}
                    title="The pinned element is not in the current page (e.g. you're viewing the thread from the list)."
                  >
                    Pin target not visible on this page
                  </span>
                </FlexItem>
              )}
              {onSummarizeThread && thread.comments.length > 0 && (
                <FlexItem>
                  <Button
                    id={`summarize-thread-${thread.id}`}
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSummarizeThread(thread);
                    }}
                    aria-label="Summarize this thread"
                  >
                    Summarize thread
                  </Button>
                </FlexItem>
              )}
              {!isAuthenticated && (
                <FlexItem>
                  <Flex
                    justifyContent={{ default: 'justifyContentCenter' }}
                    spaceItems={{ default: 'spaceItemsSm' }}
                  >
                    <Button
                      id={`sign-in-gitlab-detail-${thread.id}`}
                      variant="link"
                      icon={<GitlabIcon />}
                      iconPosition="start"
                      onClick={() => login()}
                    >
                      Sign in with GitLab
                    </Button>
                    {devFakeLogin && (
                      <Button
                        id={`fake-signin-detail-${thread.id}`}
                        variant="link"
                        onClick={() => devFakeLogin()}
                      >
                        Fake sign in (dev)
                      </Button>
                    )}
                  </Flex>
                </FlexItem>
              )}
            </Flex>
          </FlexItem>
        </Flex>
      </FlexItem>

      {(summaryLoading || summaryContent) && (
        <FlexItem style={{ flexShrink: 0, paddingTop: '4px' }}>
          <Card id="discussions-summary-card-thread" isCompact>
            <ExpandableSection
              toggleText={
                summaryThreadExpanded ? 'Collapse summary' : summaryTitle || 'Summary'
              }
              isExpanded={summaryThreadExpanded}
              onToggle={() => setSummaryThreadExpanded(!summaryThreadExpanded)}
              id="discussions-summary-expandable-thread"
            >
              <CardBody>
                {summaryLoading ? (
                  <Flex justifyContent={{ default: 'justifyContentCenter' }} style={{ padding: '16px' }}>
                    <Spinner size="lg" aria-label="Loading summary" />
                  </Flex>
                ) : (
                  <Content component="p" style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                    {summaryContent || '—'}
                  </Content>
                )}
              </CardBody>
              <CardFooter>
                <Button
                  id="discussions-summary-card-thread-close"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseSummary?.();
                  }}
                >
                  Close
                </Button>
              </CardFooter>
            </ExpandableSection>
          </Card>
        </FlexItem>
      )}

      {/* Comments list */}
      <FlexItem
        grow={{ default: 'grow' }}
        style={{ overflowY: 'auto', padding: '8px 0', minWidth: 0 }}
      >
        {thread.comments.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--pf-t--global--text--color--subtle)',
              fontSize: '13px',
            }}
          >
            No comments yet. Add a comment below.
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <CommentCard
              key={comment.id}
              {...commentCardProps}
              comment={comment}
              depth={0}
            />
          ))
        )}
        <div ref={commentsEndRef} />
      </FlexItem>

      {/* Reply input + actions */}
      <FlexItem
        style={{
          borderTop: '1px solid var(--pf-t--global--border--color--default)',
          padding: '8px 16px',
        }}
      >
        <TextArea
          id={`reply-input-${thread.id}`}
          value={replyText}
          onChange={(_e, val) => setReplyText(val)}
          onKeyDown={handleKeyDown}
          placeholder={isAuthenticated ? 'Add a comment...' : 'Sign in to comment'}
          aria-label="Reply"
          rows={2}
          isDisabled={!isAuthenticated}
          resizeOrientation="vertical"
        />
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'nowrap' }}
          justifyContent={{ default: 'justifyContentFlexStart' }}
          spaceItems={{ default: 'spaceItemsMd' }}
          style={{ marginTop: '8px' }}
        >
          <FlexItem>
            <Button
              id={`submit-reply-${thread.id}`}
              variant="primary"
              onClick={handleSubmitReply}
              isDisabled={!replyText.trim() || !isAuthenticated}
            >
              Comment
            </Button>
          </FlexItem>
          <FlexItem>
            {thread.status === 'open' ? (
              <Tooltip content="Close this thread as a GitLab issue. Closed threads are hidden unless Show Closed Threads is on.">
                <Button
                  id={`close-thread-${thread.id}`}
                  variant="secondary"
                  onClick={() => closeThread(thread.id)}
                  isDisabled={!isAuthenticated}
                >
                  Close Issue
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="Reopen this thread in the UI and GitLab.">
                <Button
                  id={`reopen-thread-${thread.id}`}
                  variant="secondary"
                  onClick={() => reopenThread(thread.id)}
                  isDisabled={!isAuthenticated}
                >
                  Reopen Issue
                </Button>
              </Tooltip>
            )}
          </FlexItem>
          <FlexItem>
            <Tooltip content="Delete thread in UI and GitLab (cannot be undone)">
              <Button
                id={`remove-pin-${thread.id}`}
                variant="plain"
                isDanger
                onClick={() => setRemoveConfirmOpen(true)}
                aria-label="Remove thread"
                icon={<TrashIcon />}
              />
            </Tooltip>
            <Modal
              id={`remove-thread-confirm-${thread.id}`}
              variant="small"
              isOpen={removeConfirmOpen}
              onClose={() => setRemoveConfirmOpen(false)}
              aria-labelledby={`remove-thread-confirm-title-${thread.id}`}
              aria-describedby={`remove-thread-confirm-body-${thread.id}`}
            >
              <ModalHeader title="Delete thread?" labelId={`remove-thread-confirm-title-${thread.id}`} />
              <ModalBody id={`remove-thread-confirm-body-${thread.id}`}>
                This will delete the thread in both the prototype and GitLab. This action cannot be undone.
              </ModalBody>
              <ModalFooter>
                <Button
                  id="remove-thread-confirm-cancel"
                  variant="link"
                  onClick={() => setRemoveConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  id="remove-thread-confirm-remove"
                  variant="danger"
                  onClick={() => {
                    removePin(thread.id);
                    setRemoveConfirmOpen(false);
                  }}
                >
                  Delete thread
                </Button>
              </ModalFooter>
            </Modal>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
};

const DISCUSSIONS_VIEW_FILTER_KEY = 'rhoai_discussions_view_filter';
/** Poll interval when Discussions tab is open and tab is visible (ms). */
const SYNC_POLL_INTERVAL_MS = 90 * 1000;
type DiscussionsViewFilter = 'all' | 'thisPageOnly';

const DiscussionsTab: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    threads,
    commentsEnabled,
    setCommentsEnabled,
    showPinsEnabled,
    setShowPinsEnabled,
    showClosedThreads,
    setShowClosedThreads,
    selectedThreadId,
    setSelectedThreadId,
    syncFromGitLab,
    isSyncing,
    hasPendingSync,
    retrySync,
  } = useComments();
  const { isAuthenticated, login, logout, user, devFakeLogin, isDevFakeAuth } = useGitLabAuth();

  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const [summaryTitle, setSummaryTitle] = React.useState('');
  const [summaryContent, setSummaryContent] = React.useState('');
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [summaryListExpanded, setSummaryListExpanded] = React.useState(false);
  const [isOAuthSetupModalOpen, setIsOAuthSetupModalOpen] = React.useState(false);
  const [viewFilter, setViewFilter] = React.useState<DiscussionsViewFilter>(() => {
    try {
      const raw = localStorage.getItem(DISCUSSIONS_VIEW_FILTER_KEY);
      return raw === 'thisPageOnly' ? 'thisPageOnly' : 'all';
    } catch {
      return 'all';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(DISCUSSIONS_VIEW_FILTER_KEY, viewFilter);
    } catch {
      // ignore
    }
  }, [viewFilter]);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  // Sync from GitLab when Discussions tab is opened so comments added elsewhere appear
  React.useEffect(() => {
    if (isAuthenticated) {
      syncFromGitLab().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Poll periodically while Discussions is open and tab is visible (Figma-like back-and-forth)
  React.useEffect(() => {
    if (!isAuthenticated) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        syncFromGitLab().catch(() => undefined);
      }, SYNC_POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopPolling();
      } else {
        startPolling();
      }
    };
    if (document.visibilityState === 'visible') {
      startPolling();
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Filter by view (all vs this page only), then sort: current-route first, then by most recent comment
  const sortedThreads = React.useMemo(() => {
    const currentRoute = location.pathname;
    const filtered =
      viewFilter === 'thisPageOnly'
        ? threads.filter((t) => t.route === currentRoute)
        : [...threads];
    return filtered
      .filter((t) => !t.isTemporary || t.comments.length > 0)
      .sort((a, b) => {
        const aIsCurrent = a.route === currentRoute ? 0 : 1;
        const bIsCurrent = b.route === currentRoute ? 0 : 1;
        if (aIsCurrent !== bIsCurrent) return aIsCurrent - bIsCurrent;

        const aLatest = a.comments[a.comments.length - 1]?.createdAt || '';
        const bLatest = b.comments[b.comments.length - 1]?.createdAt || '';
        return bLatest.localeCompare(aLatest);
      });
  }, [threads, location.pathname, viewFilter]);

  const handleSelectThread = (thread: Thread) => {
    setSelectedThreadId(thread.id);
    if (thread.route !== location.pathname) {
      navigate(thread.route);
    }
  };

  const handleSync = () => {
    syncFromGitLab().catch(() => undefined);
  };
  const oauthCallbackUrl = `${window.location.origin}${process.env.PUBLIC_PATH || ''}/auth/gitlab/callback`;

  const handleSummarizeVisible = React.useCallback(async () => {
    const scope = viewFilter === 'thisPageOnly' ? 'thisPage' : 'all';
    const title =
      viewFilter === 'thisPageOnly'
        ? 'Summary of discussions on this page'
        : 'Summary of all discussions';
    const signature = threadsToSignature(sortedThreads, scope);
    const cached = getCachedSummary(scope, signature);
    if (cached) {
      setSummaryTitle(cached.title);
      setSummaryContent(cached.content);
      setSummaryListExpanded(false);
      return;
    }
    setSummaryTitle(title);
    setSummaryContent('');
    setSummaryLoading(true);
    try {
      const prompt = buildPromptForThreads(sortedThreads, scope);
      const summary = await fetchSummary(prompt);
      setSummaryContent(summary);
      setCachedSummary(scope, signature, title, summary);
      setSummaryListExpanded(false);
    } finally {
      setSummaryLoading(false);
    }
  }, [sortedThreads, viewFilter]);

  const handleSummarizeThread = React.useCallback(async (thread: Thread) => {
    const title = 'Summary of this thread';
    const signature = threadSignature(thread);
    const cached = getCachedSummaryForThread(thread.id, signature);
    if (cached) {
      setSummaryTitle(cached.title);
      setSummaryContent(cached.content);
      return;
    }
    setSummaryTitle(title);
    setSummaryContent('');
    setSummaryLoading(true);
    try {
      const prompt = buildPromptForThread(thread);
      const summary = await fetchSummary(prompt);
      setSummaryContent(summary);
      setCachedSummaryForThread(thread.id, signature, title, summary);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const handleCloseSummary = React.useCallback(() => {
    setSummaryContent('');
  }, []);

  // If a thread is selected, show its detail view
  if (selectedThread) {
    return (
      <>
        <ThreadDetailView
          thread={selectedThread}
          onBack={() => setSelectedThreadId(null)}
          onSummarizeThread={handleSummarizeThread}
          summaryTitle={summaryTitle}
          summaryContent={summaryContent}
          summaryLoading={summaryLoading}
          onCloseSummary={handleCloseSummary}
        />
      </>
    );
  }

  return (
    <div
      id="discussions-tab-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
    <Flex
      direction={{ default: 'column' }}
      style={{
        height: '100%',
        width: '100%',
        minWidth: 0,
        flex: '1 1 0',
        minHeight: 0,
        // Inline column direction so Summarize + thread list stack in prod builds where
        // pf-m-column may not apply (CSS order/purging); default pf-v6-l-flex is row.
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
      spaceItems={{ default: 'spaceItemsNone' }}
    >
      {/* Toolbar */}
      <FlexItem>
        <Toolbar
          id="discussions-toolbar"
          isSticky
          style={{
            padding: '4px 8px',
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
          }}
        >
          <ToolbarContent rowWrap={{ default: 'wrap' }}>
            <ToolbarGroup
              align={{ default: 'alignStart' }}
            >
              <ToolbarItem>
                <Button
                  id="discussions-add-comment-btn"
                  variant="link"
                  icon={<PlusCircleIcon />}
                  iconPosition="start"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCommentsEnabled(true);
                  }}
                  aria-label="Add comment (then Option + click on page to place a pin)"
                >
                  Add comment
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Tooltip
                  content={
                    viewFilter === 'all'
                      ? 'Showing all comments. Click to show this page only.'
                      : 'Showing this page only. Click to show all comments.'
                  }
                >
                  <Button
                    id="discussions-view-filter-toggle"
                    variant="plain"
                    icon={
                      viewFilter === 'all' ? (
                        <GlobeIcon />
                      ) : (
                        <FileAltIcon />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFilter(viewFilter === 'all' ? 'thisPageOnly' : 'all');
                    }}
                    aria-label={
                      viewFilter === 'all'
                        ? 'View all comments. Click to show this page only.'
                        : 'View this page only. Click to show all comments.'
                    }
                  />
                </Tooltip>
              </ToolbarItem>
              <ToolbarItem>
                <Tooltip
                  content={
                    commentsEnabled
                      ? 'Pins stay visible while adding a comment'
                      : showPinsEnabled
                        ? 'Hide pins'
                        : 'Show pins'
                  }
                >
                  <Button
                    id="toggle-pins-btn"
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (commentsEnabled) return;
                      setShowPinsEnabled(!showPinsEnabled);
                    }}
                    aria-label={
                      commentsEnabled
                        ? 'Pins stay visible while adding a comment'
                        : showPinsEnabled
                          ? 'Hide pins'
                          : 'Show pins'
                    }
                    icon={
                      showPinsEnabled ? (
                        <CommentsIcon />
                      ) : (
                        <OutlinedCommentsIcon />
                      )
                    }
                  />
                </Tooltip>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                {hasPendingSync && isAuthenticated && (
                  <Tooltip content="Retry syncing failed or pending discussions">
                    <Button
                      id="retry-sync-discussions-btn"
                      variant="secondary"
                      onClick={() => retrySync().catch(() => undefined)}
                      isLoading={isSyncing}
                      aria-label="Retry sync"
                    >
                      Retry sync
                    </Button>
                  </Tooltip>
                )}
              </ToolbarItem>
              <ToolbarItem>
                {isAuthenticated ? (
                  <Dropdown
                    id="discussions-account-menu"
                    isOpen={accountMenuOpen}
                    onSelect={() => setAccountMenuOpen(false)}
                    onOpenChange={(open) => setAccountMenuOpen(open)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        id="discussions-account-menu-toggle"
                        variant="plain"
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                        isExpanded={accountMenuOpen}
                        aria-label="Account and sync actions"
                        icon={<EllipsisVIcon />}
                      />
                    )}
                    popperProps={{ position: 'right' }}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>
                      <DropdownItem
                        id="discussions-account-signed-in"
                        isDisabled
                      >
                        Signed in as {user?.login}
                        {isDevFakeAuth ? ' (dev mode)' : ''}
                      </DropdownItem>
                      <DropdownItem
                        id="discussions-account-menu-sync"
                        value="sync"
                        icon={<SyncAltIcon />}
                        onClick={() => {
                          handleSync();
                          setAccountMenuOpen(false);
                        }}
                      >
                        Sync
                      </DropdownItem>
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
                        <Switch
                          id="discussions-closed-threads-switch"
                          label="Show Closed Threads"
                          isChecked={showClosedThreads}
                          onChange={(_e, checked) => setShowClosedThreads(checked)}
                          isReversed
                          aria-label="Show closed threads on page"
                        />
                      </div>
                      <DropdownItem
                        id="discussions-account-menu-logout"
                        value="logout"
                        onClick={() => {
                          logout();
                          setAccountMenuOpen(false);
                        }}
                      >
                        Log out
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                ) : null}
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </FlexItem>

      {hasPendingSync && isAuthenticated && (
        <FlexItem>
          <Content
            component="p"
            style={{
              fontSize: '12px',
              color: 'var(--pf-t--global--color--status--warning--default)',
              marginTop: 0,
              marginBottom: 0,
              paddingLeft: '8px',
              paddingRight: '8px',
            }}
            id="discussions-sync-issues-message"
          >
            Some discussions have sync issues. Use Retry sync to try again.
          </Content>
        </FlexItem>
      )}

      {commentsEnabled && (
        <FlexItem>
          <Content
            component="p"
            style={{
              fontSize: '12px',
              color: 'var(--pf-t--global--text--color--subtle)',
              marginTop: 4,
              marginBottom: 0,
              paddingLeft: '8px',
            }}
            id="discussions-alt-click-hint"
          >
            Hold Option + click (Mac) or Alt + click (Windows/Linux) to leave a comment.
          </Content>
        </FlexItem>
      )}

      {isAuthenticated && sortedThreads.length > 0 && (
        <FlexItem style={{ padding: '4px 8px 8px 8px' }}>
          {summaryLoading || summaryContent ? (
            <Card id="discussions-summary-card-list" isCompact>
              <ExpandableSection
                toggleText={
                  summaryListExpanded ? 'Collapse summary' : summaryTitle || 'Summary'
                }
                isExpanded={summaryListExpanded}
                onToggle={() => setSummaryListExpanded(!summaryListExpanded)}
                id="discussions-summary-expandable-list"
              >
                <CardBody>
                  {summaryLoading ? (
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} style={{ padding: '16px' }}>
                      <Spinner size="lg" aria-label="Loading summary" />
                    </Flex>
                  ) : (
                    <Content component="p" style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                      {summaryContent || '—'}
                    </Content>
                  )}
                </CardBody>
                <CardFooter>
                  <Button
                    id="discussions-summary-card-list-close"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseSummary();
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    id="discussions-summary-card-list-again"
                    variant="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSummarizeVisible();
                    }}
                  >
                    Summarize again
                  </Button>
                </CardFooter>
              </ExpandableSection>
            </Card>
          ) : (
            <Tooltip
              content={
                viewFilter === 'thisPageOnly'
                  ? 'Get an AI summary of discussions on this page'
                  : 'Get an AI summary of all discussions'
              }
            >
              <Button
                id="discussions-summarize-btn"
                variant="secondary"
                isBlock
                onClick={(e) => {
                  e.stopPropagation();
                  handleSummarizeVisible();
                }}
                aria-label="Summarize discussions"
              >
                Summarize
              </Button>
            </Tooltip>
          )}
        </FlexItem>
      )}

      {/* Thread list */}
      <FlexItem grow={{ default: 'grow' }} style={{ overflowY: 'auto', minWidth: 0 }}>
        {!isAuthenticated ? (
          <EmptyState
            titleText="Sign in to view discussions"
            variant="sm"
            icon={OutlinedCommentsIcon}
            id="discussions-signin-empty"
          >
            <EmptyStateBody>
              Connect your GitLab account to view and create discussions on this
              prototype.
            </EmptyStateBody>
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
              style={{ marginTop: '16px' }}
            >
              <Flex
                justifyContent={{ default: 'justifyContentCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
              >
                <Button
                  id="discussions-signin-btn"
                  variant="primary"
                  onClick={() => login()}
                >
                  Sign in with GitLab
                </Button>
                {devFakeLogin && (
                  <Button
                    id="discussions-fake-signin-btn"
                    variant="secondary"
                    onClick={() => devFakeLogin()}
                  >
                    Fake sign in (dev)
                  </Button>
                )}
              </Flex>
              <Button
                id="discussions-oauth-setup-link"
                variant="link"
                onClick={() => setIsOAuthSetupModalOpen(true)}
              >
                Set up OAuth for your fork
              </Button>
            </Flex>
            <Modal
              id="discussions-oauth-setup-modal"
              isOpen={isOAuthSetupModalOpen}
              onClose={() => setIsOAuthSetupModalOpen(false)}
              appendTo={document.body}
              position="top"
              className="pf-m-md"
            >
              <ModalHeader
                title="Set up GitLab OAuth for your fork"
                labelId="discussions-oauth-setup-title"
              />
              <ModalBody id="discussions-oauth-setup-body">
                <Content component="p">
                  If Sign in with GitLab does not open GitLab, your fork likely needs its own OAuth app
                  and environment variables.
                </Content>
                <Content component="h4">1) Open GitLab and start a new application</Content>
                <Content component="p">
                  Open{' '}
                  <a
                    href="https://gitlab.cee.redhat.com/-/profile/applications"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitLab Applications
                  </a>{' '}
                  (under your profile), then click <strong>Add new application</strong>.
                </Content>
                <Content component="h4">2) Name and redirect URI</Content>
                <Content component="p">
                  In the same form, give the application a name (for example:{' '}
                  <code>rhoai-fork-comments</code>). Then in <strong>Redirect URI</strong>, paste the callback
                  URL for your deployed fork. Use this value exactly:
                </Content>
                <ClipboardCopy
                  id="discussions-oauth-callback-copy"
                  copyAriaLabel="Copy deployment redirect URI"
                  isReadOnly
                  hoverTip="Copy"
                  clickTip="Copied"
                >
                  {oauthCallbackUrl}
                </ClipboardCopy>
                <Content component="h4">3) Uncheck Confidential</Content>
                <Content component="p">
                  Turn off <strong>Confidential</strong>. This prototype uses a <strong>public</strong> app
                  with PKCE, which matches how the sign-in flow exchanges the authorization code—no client
                  secret is sent from the browser.
                </Content>
                <Content component="h4">4) Add the api scope</Content>
                <Content component="p">
                  Under <strong>Scopes</strong>, select <strong>api</strong> so the app can create and sync
                  discussion issues on your behalf.
                </Content>
                <Content component="h4">5) Save and copy Application ID</Content>
                <Content component="p">
                  Save the application. On the confirmation page, <strong>copy the Application ID</strong>{' '}
                  before you leave—you will paste it into fork CI/CD variables below. If you leave this page,
                  you can reopen the app anytime from the Applications list and copy the ID again.
                </Content>
                <Content component="p">
                  <strong>Application secret:</strong> GitLab shows a secret, but <strong>this sign-in flow
                  does not use it</strong>. You do not need to add the secret to CI/CD variables for this
                  prototype.
                </Content>
                <Content component="h4">6) Return to your fork repository</Content>
                <Content component="p">
                  You are still in <strong>User settings → Applications</strong>, where the left sidebar
                  does <strong>not</strong> include your fork&apos;s project <strong>Settings</strong>.
                  Open your fork from the GitLab menu or search (your copy of the repo), then continue to
                  CI/CD variables in the next step.
                </Content>
                <Content component="h4">7) Configure your fork variables</Content>
                <Content component="p">
                  In your GitLab fork, go to <strong>Settings &gt; CI/CD &gt; Variables</strong>,
                  then set these variables for builds:
                </Content>
                <Content component="p">
                  For each entry, click <strong>Add variable</strong> and use:
                </Content>
                <Content component="ul">
                  <Content component="li">
                    <strong>Type:</strong> Variable
                  </Content>
                  <Content component="li">
                    <strong>Environment scope:</strong> All (or <code>*</code>)
                  </Content>
                  <Content component="li">
                    <strong>Visibility:</strong> Visible
                  </Content>
                  <Content component="li">
                    <strong>Flags:</strong> leave unchecked (<strong>Protected</strong> off, <strong>Expand
                    variable reference</strong> off)
                  </Content>
                  <Content component="li">
                    <strong>Key</strong> = variable name, <strong>Value</strong> = text after <code>=</code>
                  </Content>
                </Content>
                <Content component="ul">
                  <Content component="li">
                    <code>VITE_GITLAB_CLIENT_ID</code> = your OAuth Application ID
                  </Content>
                  <Content component="li">
                    <code>VITE_GITLAB_BASE_URL</code> = <code>https://gitlab.cee.redhat.com</code>
                  </Content>
                  <Content component="li">
                    <code>VITE_GITLAB_PROJECT_PATH</code> = everything after <code>.com/</code>
                    <Content component="p" style={{ marginTop: '8px', marginBottom: 0 }}>
                      Example: instead of full path{' '}
                      <code>https://gitlab.cee.redhat.com/juhale/rhoai</code> use{' '}
                      <strong>
                        <code>juhale/rhoai</code>
                      </strong>{' '}
                      as the value.
                    </Content>
                  </Content>
                </Content>
                <Content component="h4">8) Rebuild your fork, then test</Content>
                <Content component="p">
                  Choose whichever option is easier:
                </Content>
                <Content component="ul">
                  <Content component="li">
                    <strong>Option A (easiest):</strong> make any small change in your fork and push it.
                    That automatically starts a new build.
                  </Content>
                  <Content component="li">
                    <strong>Option B:</strong> in GitLab go to <strong>Build &gt; Pipelines</strong>, click{' '}
                    <strong>Run pipeline</strong>, and run it on your branch.
                  </Content>
                </Content>
                <Content component="p">
                  After the build finishes, refresh this page and try <strong>Sign in with GitLab</strong>{' '}
                  again.
                </Content>
                <Content component="h4">If you see &quot;unknown client&quot; or client authentication failed</Content>
                <Content component="p">
                  That usually means GitLab does not recognize the <strong>client_id</strong> your site is
                  sending. Check that <code>VITE_GITLAB_CLIENT_ID</code> matches the <strong>Application
                  ID</strong> from GitLab exactly (no extra spaces), that you ran a <strong>new pipeline
                  after</strong> setting variables so the deployed bundle picked them up, and that the
                  <strong>Redirect URI</strong> in the OAuth app matches this deployment (same origin and
                  path as the value above). Confirm the app is saved, <strong>Confidential</strong> is off,
                  and <strong>api</strong> is selected.
                </Content>
              </ModalBody>
              <ModalFooter>
                <Button
                  id="discussions-oauth-setup-close"
                  variant="primary"
                  onClick={() => setIsOAuthSetupModalOpen(false)}
                >
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </EmptyState>
        ) : sortedThreads.length === 0 ? (
          viewFilter === 'thisPageOnly' && threads.length > 0 ? (
            <EmptyState
              titleText="No comments on this page"
              variant="sm"
              icon={OutlinedCommentsIcon}
              id="discussions-empty-this-page"
            >
              <EmptyStateBody>
                There are no discussions on this page. Switch to &quot;All
                comments&quot; to see discussions from other pages, or enable
                comment mode and hold Option + click (or Alt + click) on an element here to start one.
              </EmptyStateBody>
              <Button
                id="discussions-switch-to-all-btn"
                variant="secondary"
                onClick={() => setViewFilter('all')}
                style={{ marginTop: '16px' }}
              >
                View all comments
              </Button>
            </EmptyState>
          ) : (
            <EmptyState
              titleText="No discussions yet"
              variant="sm"
              icon={PlusCircleIcon}
              id="discussions-empty"
            >
              <EmptyStateBody>
                Enable comment mode and hold Option + click (Mac) or Alt + click (Windows/Linux)
                on an element to start a discussion.
              </EmptyStateBody>
            </EmptyState>
          )
        ) : (
          sortedThreads.map((thread) => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              isCurrentRoute={thread.route === location.pathname}
              onSelect={() => handleSelectThread(thread)}
            />
          ))
        )}
      </FlexItem>
    </Flex>
    </div>
  );
};

export default DiscussionsTab;
