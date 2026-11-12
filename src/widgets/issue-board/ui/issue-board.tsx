'use client';

// TODO(임시): 발표용 임시 칸반. 목 데이터와 로컬 상태(useState)로만 동작한다.
// 서버 이슈 API를 연동할 때는 이 위젯의 상태·드래그 처리를 서버 호출로 바꾸고,
// 연동하지 않기로 하면 이 폴더와 entities/issue, app/(main)/teams/[teamId]/issues를 지운다.
import { useState } from 'react';

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';

import {
  ISSUE_STATUS_LABEL,
  ISSUE_STATUSES,
  type Issue,
  type IssueStatus,
} from '@/entities/issue/model/issue';
import { MOCK_ISSUES } from '@/entities/issue/model/mock-issues';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

export function IssueBoard() {
  // TODO(임시): 목 데이터를 로컬 상태로 들고 있다. 서버 연동 시 쿼리로 교체한다.
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [nextId, setNextId] = useState(100);

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination) return;

    const from = source.droppableId as IssueStatus;
    const to = destination.droppableId as IssueStatus;
    setIssues((current) => {
      const next = { ...current, [from]: [...current[from]] };
      const [moved] = next[from].splice(source.index, 1);
      if (!moved) return current;
      next[to] = from === to ? next[from] : [...current[to]];
      next[to].splice(destination.index, 0, moved);
      return next;
    });
  };

  // TODO(임시): 제목만 가진 이슈를 계획됨에 추가한다. 서버 연동 시 이슈 생성 요청으로 교체한다.
  const addIssue = () => {
    setIssues((current) => ({
      ...current,
      PLANNED: [
        { id: nextId, title: `새 이슈 #${nextId}`, labels: [] },
        ...current.PLANNED,
      ],
    }));
    setNextId((id) => id + 1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center gap-3 px-6">
        <h1 className="typography-label-medium text-on-surface">이슈</h1>
        <Button size="S" className="ml-auto" onClick={addIssue}>
          + 새 이슈
        </Button>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid min-h-0 flex-1 grid-cols-3 items-start gap-3 overflow-x-auto px-6 pb-6">
          {ISSUE_STATUSES.map((status) => (
            <Column key={status} status={status} issues={issues[status]} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function Column({ status, issues }: { status: IssueStatus; issues: Issue[] }) {
  return (
    <section className="flex max-h-full min-w-64 flex-col gap-3 rounded-xl bg-surface-container p-3">
      <h2 className="flex items-center gap-2 typography-label-medium text-on-surface">
        <span aria-hidden className="size-1.5 rounded-full bg-on-surface" />
        {ISSUE_STATUS_LABEL[status]}
        <Badge>{issues.length}</Badge>
      </h2>
      <Droppable droppableId={status}>
        {(droppable, snapshot) => (
          <ul
            ref={droppable.innerRef}
            {...droppable.droppableProps}
            className={cn(
              'flex min-h-8 flex-col gap-2 overflow-y-auto rounded-lg',
              snapshot.isDraggingOver && 'bg-surface-container-high',
            )}
          >
            {issues.map((issue, index) => (
              <Draggable
                key={issue.id}
                draggableId={String(issue.id)}
                index={index}
              >
                {(draggable, dragSnapshot) => (
                  <li
                    ref={draggable.innerRef}
                    {...draggable.draggableProps}
                    {...draggable.dragHandleProps}
                  >
                    <IssueCard
                      issue={issue}
                      dragging={dragSnapshot.isDragging}
                    />
                  </li>
                )}
              </Draggable>
            ))}
            {droppable.placeholder}
          </ul>
        )}
      </Droppable>
    </section>
  );
}

function IssueCard({ issue, dragging }: { issue: Issue; dragging: boolean }) {
  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface p-3',
        dragging && 'shadow-lg',
      )}
    >
      {issue.labels.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {issue.labels.map((label) => (
            <Badge key={label.name} color={label.color}>
              {label.name}
            </Badge>
          ))}
        </span>
      )}
      <p className="typography-label-small break-words text-on-surface">
        {issue.title}
      </p>
      <div className="flex items-center gap-2 typography-subtext-medium text-on-surface-variant">
        <span>#{issue.id}</span>
        {issue.dueDate && <span className="ml-auto">{issue.dueDate}</span>}
        {issue.assignee && (
          <Avatar
            name={issue.assignee}
            size={20}
            shape="circle"
            className={issue.dueDate ? undefined : 'ml-auto'}
          />
        )}
      </div>
    </article>
  );
}
