
  create table "public"."accreditation" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "agenda_item_id" uuid not null,
    "user_id" uuid not null,
    "confirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."accreditation" enable row level security;


  create table "public"."action_right" (
    "id" uuid not null default gen_random_uuid(),
    "resource" text,
    "action" text,
    "role_id" uuid not null,
    "group_id" uuid,
    "event_id" uuid,
    "amendment_id" uuid,
    "blog_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."action_right" enable row level security;


  create table "public"."agenda_item" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid,
    "amendment_id" uuid,
    "creator_id" uuid not null,
    "title" text,
    "description" text,
    "type" text,
    "status" text,
    "forwarding_status" text,
    "order_index" integer,
    "duration" integer,
    "scheduled_time" text,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "activated_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "majority_type" text,
    "time_limit" integer,
    "voting_phase" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."agenda_item" enable row level security;


  create table "public"."amendment" (
    "id" uuid not null default gen_random_uuid(),
    "code" text,
    "title" text,
    "status" text,
    "workflow_status" text,
    "reason" text,
    "category" text,
    "preamble" text,
    "created_by_id" uuid not null,
    "group_id" uuid,
    "event_id" uuid,
    "clone_source_id" uuid,
    "document_id" uuid,
    "supporters" integer not null default 0,
    "supporters_required" integer,
    "supporters_percentage" numeric,
    "upvotes" integer not null default 0,
    "downvotes" integer not null default 0,
    "tags" jsonb,
    "visibility" text not null default 'public'::text,
    "is_public" boolean not null default true,
    "subscriber_count" integer not null default 0,
    "clone_count" integer not null default 0,
    "change_request_count" integer not null default 0,
    "editing_mode" text,
    "discussions" jsonb,
    "comment_count" integer not null default 0,
    "collaborator_count" integer not null default 0,
    "image_url" text,
    "x" text,
    "youtube" text,
    "linkedin" text,
    "website" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment" enable row level security;


  create table "public"."amendment_collaborator" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "user_id" uuid not null,
    "role_id" uuid,
    "status" text,
    "visibility" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment_collaborator" enable row level security;


  create table "public"."amendment_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment_hashtag" enable row level security;


  create table "public"."amendment_path" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "title" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment_path" enable row level security;


  create table "public"."amendment_path_segment" (
    "id" uuid not null default gen_random_uuid(),
    "path_id" uuid not null,
    "group_id" uuid,
    "event_id" uuid,
    "order_index" integer,
    "status" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment_path_segment" enable row level security;


  create table "public"."amendment_support_vote" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment_support_vote" enable row level security;


  create table "public"."amendment_vote_entry" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "user_id" uuid not null,
    "vote" integer,
    "is_indication" boolean not null default false,
    "indicated_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."amendment_vote_entry" enable row level security;


  create table "public"."blog" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "description" text,
    "content" jsonb,
    "date" text,
    "image_url" text,
    "is_public" boolean,
    "visibility" text not null default 'public'::text,
    "subscriber_count" integer not null default 0,
    "supporter_count" integer not null default 0,
    "like_count" integer not null default 0,
    "comment_count" integer not null default 0,
    "upvotes" integer not null default 0,
    "downvotes" integer not null default 0,
    "editing_mode" text,
    "discussions" jsonb,
    "group_id" uuid,
    "updated_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."blog" enable row level security;


  create table "public"."blog_blogger" (
    "id" uuid not null default gen_random_uuid(),
    "blog_id" uuid not null,
    "user_id" uuid not null,
    "role_id" uuid,
    "status" text,
    "visibility" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."blog_blogger" enable row level security;


  create table "public"."blog_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "blog_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."blog_hashtag" enable row level security;


  create table "public"."blog_support_vote" (
    "id" uuid not null default gen_random_uuid(),
    "blog_id" uuid not null,
    "user_id" uuid not null,
    "vote" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."blog_support_vote" enable row level security;


  create table "public"."calendar_subscription" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "target_type" text not null,
    "target_group_id" uuid,
    "target_user_id" uuid,
    "is_visible" boolean not null default true,
    "color" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."calendar_subscription" enable row level security;


  create table "public"."change_request" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "user_id" uuid not null,
    "title" text,
    "description" text,
    "status" text,
    "reason" text,
    "source_type" text,
    "source_id" uuid,
    "source_title" text,
    "votes_for" integer not null default 0,
    "votes_against" integer not null default 0,
    "votes_abstain" integer not null default 0,
    "voting_status" text not null default 'open'::text,
    "voting_deadline" timestamp with time zone,
    "voting_majority_type" text,
    "quorum_required" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."change_request" enable row level security;


  create table "public"."change_request_vote" (
    "id" uuid not null default gen_random_uuid(),
    "change_request_id" uuid not null,
    "user_id" uuid not null,
    "vote" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."change_request_vote" enable row level security;


  create table "public"."comment" (
    "id" uuid not null default gen_random_uuid(),
    "thread_id" uuid not null,
    "user_id" uuid not null,
    "parent_id" uuid,
    "content" text,
    "upvotes" integer not null default 0,
    "downvotes" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."comment" enable row level security;


  create table "public"."comment_vote" (
    "id" uuid not null default gen_random_uuid(),
    "comment_id" uuid not null,
    "user_id" uuid not null,
    "vote" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."comment_vote" enable row level security;


  create table "public"."conversation" (
    "id" uuid not null default gen_random_uuid(),
    "type" text,
    "name" text,
    "status" text,
    "pinned" boolean,
    "last_message_at" timestamp with time zone,
    "group_id" uuid,
    "requested_by_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."conversation" enable row level security;


  create table "public"."conversation_participant" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "user_id" uuid not null,
    "joined_at" timestamp with time zone not null default now(),
    "last_read_at" timestamp with time zone,
    "left_at" timestamp with time zone
      );


alter table "public"."conversation_participant" enable row level security;


  create table "public"."document" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid,
    "content" jsonb,
    "editing_mode" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."document" enable row level security;


  create table "public"."document_collaborator" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "user_id" uuid not null,
    "role_id" uuid,
    "status" text,
    "visibility" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."document_collaborator" enable row level security;


  create table "public"."document_cursor" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "user_id" uuid not null,
    "position" jsonb,
    "selection" jsonb,
    "color" text,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."document_cursor" enable row level security;


  create table "public"."document_version" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid not null,
    "amendment_id" uuid,
    "blog_id" uuid,
    "content" jsonb,
    "version_number" integer,
    "change_summary" text,
    "author_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."document_version" enable row level security;


  create table "public"."election" (
    "id" uuid not null default gen_random_uuid(),
    "agenda_item_id" uuid,
    "position_id" uuid,
    "title" text,
    "description" text,
    "status" text,
    "majority_type" text,
    "closing_type" text,
    "closing_duration_seconds" integer,
    "closing_end_time" timestamp with time zone,
    "is_public" boolean not null default true,
    "max_votes" integer not null default 1,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."election" enable row level security;


  create table "public"."election_candidate" (
    "id" uuid not null default gen_random_uuid(),
    "election_id" uuid not null,
    "user_id" uuid not null,
    "name" text,
    "description" text,
    "image_url" text,
    "status" text not null default 'nominated'::text,
    "order_index" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."election_candidate" enable row level security;


  create table "public"."elector" (
    "id" uuid not null default gen_random_uuid(),
    "election_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."elector" enable row level security;


  create table "public"."event" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "description" text,
    "status" text,
    "event_type" text,
    "location_type" text,
    "location_name" text,
    "location_address" text,
    "location_url" text,
    "location_coordinates" text,
    "is_public" boolean not null default true,
    "visibility" text not null default 'public'::text,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "timezone" text,
    "capacity" integer,
    "participant_count" integer not null default 0,
    "subscriber_count" integer not null default 0,
    "election_count" integer not null default 0,
    "amendment_count" integer not null default 0,
    "open_change_request_count" integer not null default 0,
    "agenda_management" text,
    "meeting_type" text,
    "is_bookable" boolean not null default false,
    "max_bookings" integer default 1,
    "is_recurring" boolean not null default false,
    "recurrence_pattern" text,
    "recurrence_rule" text,
    "recurrence_interval" integer default 1,
    "recurrence_days" integer[],
    "recurrence_end_date" timestamp with time zone,
    "original_event_id" uuid,
    "cancel_reason" text,
    "cancelled_at" timestamp with time zone,
    "cancelled_by_id" uuid,
    "x" text,
    "youtube" text,
    "linkedin" text,
    "website" text,
    "stream_url" text,
    "image_url" text,
    "has_delegates" boolean not null default false,
    "delegate_count" integer not null default 0,
    "delegate_distribution_method" text,
    "delegate_distribution_status" text,
    "delegate_seat_allocation_type" text,
    "total_delegate_seats" integer,
    "delegate_quorum_percentage" numeric,
    "delegate_vote_weight_type" text,
    "delegate_vote_threshold_percentage" numeric,
    "delegate_accepted_states" jsonb,
    "delegate_finalized_at" timestamp with time zone,
    "delegate_approval_type" text,
    "delegate_check_mode" text,
    "main_group_delegate_allocation_mode" text,
    "current_agenda_item_id" uuid,
    "amendment_deadline" timestamp with time zone,
    "registration_deadline" timestamp with time zone,
    "candidacy_deadline" timestamp with time zone,
    "delegates_nomination_deadline" timestamp with time zone,
    "group_id" uuid,
    "creator_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."event" enable row level security;


  create table "public"."event_delegate" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "group_id" uuid,
    "status" text,
    "seat_count" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."event_delegate" enable row level security;


  create table "public"."event_exception" (
    "id" uuid not null default gen_random_uuid(),
    "parent_event_id" uuid not null,
    "original_date" timestamp with time zone not null,
    "action" text not null,
    "new_title" text,
    "new_description" text,
    "new_start_date" timestamp with time zone,
    "new_end_date" timestamp with time zone,
    "new_location_name" text,
    "new_location_address" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."event_exception" enable row level security;


  create table "public"."event_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."event_hashtag" enable row level security;


  create table "public"."event_participant" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "group_id" uuid,
    "status" text,
    "role_id" uuid,
    "visibility" text,
    "instance_date" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."event_participant" enable row level security;


  create table "public"."event_position" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "title" text,
    "description" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."event_position" enable row level security;


  create table "public"."event_position_holder" (
    "id" uuid not null default gen_random_uuid(),
    "position_id" uuid not null,
    "user_id" uuid not null,
    "group_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."event_position_holder" enable row level security;


  create table "public"."file" (
    "id" uuid not null default gen_random_uuid(),
    "path" text,
    "url" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."file" enable row level security;


  create table "public"."final_candidate_selection" (
    "id" uuid not null default gen_random_uuid(),
    "election_id" uuid not null,
    "candidate_id" uuid not null,
    "elector_participation_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."final_candidate_selection" enable row level security;


  create table "public"."final_choice_decision" (
    "id" uuid not null default gen_random_uuid(),
    "vote_id" uuid not null,
    "choice_id" uuid not null,
    "voter_participation_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."final_choice_decision" enable row level security;


  create table "public"."final_elector_participation" (
    "id" uuid not null default gen_random_uuid(),
    "election_id" uuid not null,
    "elector_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."final_elector_participation" enable row level security;


  create table "public"."final_voter_participation" (
    "id" uuid not null default gen_random_uuid(),
    "vote_id" uuid not null,
    "voter_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."final_voter_participation" enable row level security;


  create table "public"."follow" (
    "id" uuid not null default gen_random_uuid(),
    "follower_id" uuid not null,
    "followee_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."follow" enable row level security;


  create table "public"."group" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "description" text,
    "location" text,
    "image_url" text,
    "is_public" boolean not null default true,
    "member_count" integer not null default 0,
    "subscriber_count" integer not null default 0,
    "event_count" integer not null default 0,
    "amendment_count" integer not null default 0,
    "document_count" integer not null default 0,
    "x" text,
    "youtube" text,
    "linkedin" text,
    "website" text,
    "visibility" text not null default 'public'::text,
    "group_type" text not null,
    "owner_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."group" enable row level security;


  create table "public"."group_delegate_allocation" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "group_id" uuid,
    "allocated_seats" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."group_delegate_allocation" enable row level security;


  create table "public"."group_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."group_hashtag" enable row level security;


  create table "public"."group_membership" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "user_id" uuid not null,
    "status" text,
    "visibility" text not null default 'public'::text,
    "role_id" uuid,
    "source" text not null default 'direct'::text,
    "source_group_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."group_membership" enable row level security;


  create table "public"."group_relationship" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" uuid not null,
    "related_group_id" uuid not null,
    "relationship_type" text,
    "with_right" text,
    "status" text,
    "initiator_group_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."group_relationship" enable row level security;


  create table "public"."hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "tag" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."hashtag" enable row level security;


  create table "public"."indicative_candidate_selection" (
    "id" uuid not null default gen_random_uuid(),
    "election_id" uuid not null,
    "candidate_id" uuid not null,
    "elector_participation_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."indicative_candidate_selection" enable row level security;


  create table "public"."indicative_choice_decision" (
    "id" uuid not null default gen_random_uuid(),
    "vote_id" uuid not null,
    "choice_id" uuid not null,
    "voter_participation_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."indicative_choice_decision" enable row level security;


  create table "public"."indicative_elector_participation" (
    "id" uuid not null default gen_random_uuid(),
    "election_id" uuid not null,
    "elector_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."indicative_elector_participation" enable row level security;


  create table "public"."indicative_voter_participation" (
    "id" uuid not null default gen_random_uuid(),
    "vote_id" uuid not null,
    "voter_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."indicative_voter_participation" enable row level security;


  create table "public"."link" (
    "id" uuid not null default gen_random_uuid(),
    "label" text,
    "url" text,
    "user_id" uuid,
    "group_id" uuid,
    "meeting_slot_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."link" enable row level security;


  create table "public"."meeting_booking" (
    "id" uuid not null default gen_random_uuid(),
    "slot_id" uuid not null,
    "user_id" uuid not null,
    "status" text,
    "message" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."meeting_booking" enable row level security;


  create table "public"."meeting_slot" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "title" text,
    "description" text,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "duration" integer,
    "is_available" boolean not null default true,
    "max_bookings" integer not null default 1,
    "booking_count" integer not null default 0,
    "meeting_type" text,
    "video_call_url" text,
    "location" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."meeting_slot" enable row level security;


  create table "public"."message" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "sender_id" uuid not null,
    "content" text,
    "is_read" boolean not null default false,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."message" enable row level security;


  create table "public"."notification" (
    "id" uuid not null default gen_random_uuid(),
    "recipient_id" uuid,
    "sender_id" uuid,
    "title" text,
    "message" text,
    "type" text,
    "action_url" text,
    "is_read" boolean not null default false,
    "related_entity_type" text,
    "on_behalf_of_entity_type" text,
    "on_behalf_of_entity_id" uuid,
    "recipient_entity_type" text,
    "recipient_entity_id" uuid,
    "related_user_id" uuid,
    "related_group_id" uuid,
    "related_amendment_id" uuid,
    "related_event_id" uuid,
    "related_blog_id" uuid,
    "on_behalf_of_group_id" uuid,
    "on_behalf_of_event_id" uuid,
    "on_behalf_of_amendment_id" uuid,
    "on_behalf_of_blog_id" uuid,
    "recipient_group_id" uuid,
    "recipient_event_id" uuid,
    "recipient_amendment_id" uuid,
    "recipient_blog_id" uuid,
    "category" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."notification" enable row level security;


  create table "public"."notification_read" (
    "id" uuid not null default gen_random_uuid(),
    "notification_id" uuid not null,
    "entity_type" text not null,
    "entity_id" uuid not null,
    "read_by_user_id" uuid,
    "read_at" timestamp with time zone not null default now()
      );


alter table "public"."notification_read" enable row level security;


  create table "public"."notification_setting" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "group_notifications" jsonb,
    "event_notifications" jsonb,
    "amendment_notifications" jsonb,
    "blog_notifications" jsonb,
    "todo_notifications" jsonb,
    "social_notifications" jsonb,
    "delivery_settings" jsonb,
    "timeline_settings" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."notification_setting" enable row level security;


  create table "public"."participant" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "user_id" uuid not null,
    "name" text,
    "email" text,
    "role" text,
    "status" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."participant" enable row level security;


  create table "public"."payment" (
    "id" uuid not null default gen_random_uuid(),
    "amount" numeric(12,2),
    "label" text,
    "type" text,
    "payer_user_id" uuid,
    "payer_group_id" uuid,
    "receiver_user_id" uuid,
    "receiver_group_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."payment" enable row level security;


  create table "public"."position" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "description" text,
    "term" text,
    "first_term_start" timestamp with time zone,
    "scheduled_revote_date" timestamp with time zone,
    "group_id" uuid not null,
    "event_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."position" enable row level security;


  create table "public"."position_holder_history" (
    "id" uuid not null default gen_random_uuid(),
    "position_id" uuid not null,
    "user_id" uuid not null,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "reason" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."position_holder_history" enable row level security;


  create table "public"."push_subscription" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "endpoint" text not null,
    "auth" text,
    "p256dh" text,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."push_subscription" enable row level security;


  create table "public"."reaction" (
    "id" uuid not null default gen_random_uuid(),
    "entity_id" uuid,
    "entity_type" text,
    "reaction_type" text,
    "user_id" uuid not null,
    "timeline_event_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."reaction" enable row level security;


  create table "public"."role" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "description" text,
    "scope" text,
    "group_id" uuid,
    "event_id" uuid,
    "amendment_id" uuid,
    "blog_id" uuid,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."role" enable row level security;


  create table "public"."speaker_list" (
    "id" uuid not null default gen_random_uuid(),
    "agenda_item_id" uuid not null,
    "user_id" uuid not null,
    "title" text,
    "order_index" integer,
    "time" integer,
    "completed" boolean not null default false,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."speaker_list" enable row level security;


  create table "public"."statement" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "group_id" uuid,
    "text" text,
    "image_url" text,
    "video_url" text,
    "visibility" text not null default 'public'::text,
    "upvotes" integer not null default 0,
    "downvotes" integer not null default 0,
    "comment_count" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."statement" enable row level security;


  create table "public"."statement_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "statement_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_hashtag" enable row level security;


  create table "public"."statement_support_vote" (
    "id" uuid not null default gen_random_uuid(),
    "statement_id" uuid not null,
    "user_id" uuid not null,
    "vote" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_support_vote" enable row level security;


  create table "public"."statement_survey" (
    "id" uuid not null default gen_random_uuid(),
    "statement_id" uuid not null,
    "question" text not null,
    "ends_at" timestamp with time zone not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_survey" enable row level security;


  create table "public"."statement_survey_option" (
    "id" uuid not null default gen_random_uuid(),
    "survey_id" uuid not null,
    "label" text not null,
    "vote_count" integer not null default 0,
    "position" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_survey_option" enable row level security;


  create table "public"."statement_survey_vote" (
    "id" uuid not null default gen_random_uuid(),
    "option_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."statement_survey_vote" enable row level security;


  create table "public"."stripe_customer" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "stripe_customer_id" text not null,
    "email" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."stripe_customer" enable row level security;


  create table "public"."stripe_payment" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "stripe_invoice_id" text not null,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "amount" integer,
    "currency" text,
    "status" text,
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."stripe_payment" enable row level security;


  create table "public"."stripe_subscription" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "stripe_subscription_id" text not null,
    "stripe_customer_id" text,
    "status" text,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean,
    "amount" integer,
    "currency" text,
    "interval_period" text,
    "canceled_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."stripe_subscription" enable row level security;


  create table "public"."subscriber" (
    "id" uuid not null default gen_random_uuid(),
    "subscriber_id" uuid not null,
    "user_id" uuid,
    "group_id" uuid,
    "amendment_id" uuid,
    "event_id" uuid,
    "blog_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."subscriber" enable row level security;


  create table "public"."support_confirmation" (
    "id" uuid not null default gen_random_uuid(),
    "amendment_id" uuid not null,
    "group_id" uuid,
    "event_id" uuid,
    "confirmed_by_id" uuid not null,
    "status" text,
    "confirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."support_confirmation" enable row level security;


  create table "public"."thread" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid,
    "amendment_id" uuid,
    "statement_id" uuid,
    "blog_id" uuid,
    "user_id" uuid not null,
    "content" text,
    "status" text not null default 'open'::text,
    "resolved_at" timestamp with time zone,
    "upvotes" integer not null default 0,
    "downvotes" integer not null default 0,
    "position" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."thread" enable row level security;


  create table "public"."thread_vote" (
    "id" uuid not null default gen_random_uuid(),
    "thread_id" uuid not null,
    "user_id" uuid not null,
    "vote" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."thread_vote" enable row level security;


  create table "public"."timeline_event" (
    "id" uuid not null default gen_random_uuid(),
    "event_type" text,
    "entity_type" text,
    "entity_id" uuid,
    "title" text,
    "description" text,
    "metadata" jsonb,
    "image_url" text,
    "video_url" text,
    "video_thumbnail_url" text,
    "content_type" text,
    "tags" jsonb,
    "stats" jsonb,
    "vote_status" text,
    "election_status" text,
    "ends_at" timestamp with time zone,
    "user_id" uuid,
    "group_id" uuid,
    "amendment_id" uuid,
    "event_id" uuid,
    "todo_id" uuid,
    "blog_id" uuid,
    "statement_id" uuid,
    "actor_id" uuid,
    "election_id" uuid,
    "amendment_vote_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."timeline_event" enable row level security;


  create table "public"."todo" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "description" text,
    "status" text,
    "priority" text,
    "due_date" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "tags" jsonb,
    "visibility" text not null default 'public'::text,
    "creator_id" uuid not null,
    "group_id" uuid,
    "event_id" uuid,
    "amendment_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."todo" enable row level security;


  create table "public"."todo_assignment" (
    "id" uuid not null default gen_random_uuid(),
    "todo_id" uuid not null,
    "user_id" uuid not null,
    "role" text,
    "assigned_at" timestamp with time zone not null default now()
      );


alter table "public"."todo_assignment" enable row level security;


  create table "public"."user" (
    "id" uuid not null default gen_random_uuid(),
    "email" text,
    "handle" text,
    "first_name" text,
    "last_name" text,
    "bio" text,
    "about" text,
    "avatar" text,
    "x" text,
    "youtube" text,
    "linkedin" text,
    "website" text,
    "location" text,
    "is_public" boolean not null default true,
    "visibility" text not null default 'public'::text,
    "subscriber_count" integer not null default 0,
    "amendment_count" integer not null default 0,
    "group_count" integer not null default 0,
    "tutorial_step" integer,
    "assistant_introduction" boolean,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user" enable row level security;


  create table "public"."user_hashtag" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "hashtag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_hashtag" enable row level security;


  create table "public"."user_preference" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "create_form_style" text not null default 'carousel'::text,
    "theme" text not null default 'system'::text,
    "language" text not null default 'en'::text,
    "navigation_view" text not null default 'asButtonList'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_preference" enable row level security;


  create table "public"."vote" (
    "id" uuid not null default gen_random_uuid(),
    "agenda_item_id" uuid,
    "amendment_id" uuid,
    "title" text,
    "description" text,
    "status" text not null default 'indicative'::text,
    "majority_type" text not null default 'relative'::text,
    "closing_type" text not null default 'moderator'::text,
    "closing_duration_seconds" integer,
    "closing_end_time" timestamp with time zone,
    "is_public" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."vote" enable row level security;


  create table "public"."vote_choice" (
    "id" uuid not null default gen_random_uuid(),
    "vote_id" uuid not null,
    "label" text not null,
    "order_index" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."vote_choice" enable row level security;


  create table "public"."voter" (
    "id" uuid not null default gen_random_uuid(),
    "vote_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."voter" enable row level security;


  create table "public"."voting_password" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "password_hash" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."voting_password" enable row level security;

CREATE UNIQUE INDEX accreditation_event_id_user_id_key ON public.accreditation USING btree (event_id, user_id);

CREATE UNIQUE INDEX accreditation_pkey ON public.accreditation USING btree (id);

CREATE UNIQUE INDEX action_right_pkey ON public.action_right USING btree (id);

CREATE UNIQUE INDEX agenda_item_pkey ON public.agenda_item USING btree (id);

CREATE UNIQUE INDEX amendment_collaborator_pkey ON public.amendment_collaborator USING btree (id);

CREATE UNIQUE INDEX amendment_hashtag_amendment_id_hashtag_id_key ON public.amendment_hashtag USING btree (amendment_id, hashtag_id);

CREATE UNIQUE INDEX amendment_hashtag_pkey ON public.amendment_hashtag USING btree (id);

CREATE UNIQUE INDEX amendment_path_pkey ON public.amendment_path USING btree (id);

CREATE UNIQUE INDEX amendment_path_segment_pkey ON public.amendment_path_segment USING btree (id);

CREATE UNIQUE INDEX amendment_pkey ON public.amendment USING btree (id);

CREATE UNIQUE INDEX amendment_support_vote_pkey ON public.amendment_support_vote USING btree (id);

CREATE UNIQUE INDEX amendment_vote_entry_pkey ON public.amendment_vote_entry USING btree (id);

CREATE UNIQUE INDEX blog_blogger_pkey ON public.blog_blogger USING btree (id);

CREATE UNIQUE INDEX blog_hashtag_blog_id_hashtag_id_key ON public.blog_hashtag USING btree (blog_id, hashtag_id);

CREATE UNIQUE INDEX blog_hashtag_pkey ON public.blog_hashtag USING btree (id);

CREATE UNIQUE INDEX blog_pkey ON public.blog USING btree (id);

CREATE UNIQUE INDEX blog_support_vote_pkey ON public.blog_support_vote USING btree (id);

CREATE UNIQUE INDEX calendar_subscription_pkey ON public.calendar_subscription USING btree (id);

CREATE UNIQUE INDEX change_request_pkey ON public.change_request USING btree (id);

CREATE UNIQUE INDEX change_request_vote_pkey ON public.change_request_vote USING btree (id);

CREATE UNIQUE INDEX comment_pkey ON public.comment USING btree (id);

CREATE UNIQUE INDEX comment_vote_pkey ON public.comment_vote USING btree (id);

CREATE UNIQUE INDEX conversation_participant_pkey ON public.conversation_participant USING btree (id);

CREATE UNIQUE INDEX conversation_pkey ON public.conversation USING btree (id);

CREATE UNIQUE INDEX document_collaborator_pkey ON public.document_collaborator USING btree (id);

CREATE UNIQUE INDEX document_cursor_pkey ON public.document_cursor USING btree (id);

CREATE UNIQUE INDEX document_pkey ON public.document USING btree (id);

CREATE UNIQUE INDEX document_version_pkey ON public.document_version USING btree (id);

CREATE UNIQUE INDEX election_candidate_pkey ON public.election_candidate USING btree (id);

CREATE UNIQUE INDEX election_pkey ON public.election USING btree (id);

CREATE UNIQUE INDEX elector_election_id_user_id_key ON public.elector USING btree (election_id, user_id);

CREATE UNIQUE INDEX elector_pkey ON public.elector USING btree (id);

CREATE UNIQUE INDEX event_delegate_pkey ON public.event_delegate USING btree (id);

CREATE UNIQUE INDEX event_exception_pkey ON public.event_exception USING btree (id);

CREATE UNIQUE INDEX event_hashtag_event_id_hashtag_id_key ON public.event_hashtag USING btree (event_id, hashtag_id);

CREATE UNIQUE INDEX event_hashtag_pkey ON public.event_hashtag USING btree (id);

CREATE UNIQUE INDEX event_participant_pkey ON public.event_participant USING btree (id);

CREATE UNIQUE INDEX event_pkey ON public.event USING btree (id);

CREATE UNIQUE INDEX event_position_holder_pkey ON public.event_position_holder USING btree (id);

CREATE UNIQUE INDEX event_position_pkey ON public.event_position USING btree (id);

CREATE UNIQUE INDEX file_pkey ON public.file USING btree (id);

CREATE UNIQUE INDEX final_candidate_selection_pkey ON public.final_candidate_selection USING btree (id);

CREATE UNIQUE INDEX final_choice_decision_pkey ON public.final_choice_decision USING btree (id);

CREATE UNIQUE INDEX final_elector_participation_election_id_elector_id_key ON public.final_elector_participation USING btree (election_id, elector_id);

CREATE UNIQUE INDEX final_elector_participation_pkey ON public.final_elector_participation USING btree (id);

CREATE UNIQUE INDEX final_voter_participation_pkey ON public.final_voter_participation USING btree (id);

CREATE UNIQUE INDEX final_voter_participation_vote_id_voter_id_key ON public.final_voter_participation USING btree (vote_id, voter_id);

CREATE UNIQUE INDEX follow_pkey ON public.follow USING btree (id);

CREATE UNIQUE INDEX group_delegate_allocation_pkey ON public.group_delegate_allocation USING btree (id);

CREATE UNIQUE INDEX group_hashtag_group_id_hashtag_id_key ON public.group_hashtag USING btree (group_id, hashtag_id);

CREATE UNIQUE INDEX group_hashtag_pkey ON public.group_hashtag USING btree (id);

CREATE UNIQUE INDEX group_membership_pkey ON public.group_membership USING btree (id);

CREATE UNIQUE INDEX group_membership_user_id_group_id_key ON public.group_membership USING btree (user_id, group_id);

CREATE UNIQUE INDEX group_pkey ON public."group" USING btree (id);

CREATE UNIQUE INDEX group_relationship_pkey ON public.group_relationship USING btree (id);

CREATE UNIQUE INDEX hashtag_pkey ON public.hashtag USING btree (id);

CREATE INDEX idx_accreditation_agenda_item ON public.accreditation USING btree (agenda_item_id);

CREATE INDEX idx_accreditation_event ON public.accreditation USING btree (event_id);

CREATE INDEX idx_accreditation_user ON public.accreditation USING btree (user_id);

CREATE INDEX idx_action_right_role ON public.action_right USING btree (role_id);

CREATE INDEX idx_agenda_item_creator ON public.agenda_item USING btree (creator_id);

CREATE INDEX idx_agenda_item_event ON public.agenda_item USING btree (event_id);

CREATE INDEX idx_amendment_collaborator_amendment ON public.amendment_collaborator USING btree (amendment_id);

CREATE INDEX idx_amendment_collaborator_user ON public.amendment_collaborator USING btree (user_id);

CREATE INDEX idx_amendment_created_by ON public.amendment USING btree (created_by_id);

CREATE INDEX idx_amendment_event ON public.amendment USING btree (event_id);

CREATE INDEX idx_amendment_group ON public.amendment USING btree (group_id);

CREATE INDEX idx_amendment_hashtag_amendment ON public.amendment_hashtag USING btree (amendment_id);

CREATE INDEX idx_amendment_hashtag_hashtag ON public.amendment_hashtag USING btree (hashtag_id);

CREATE INDEX idx_amendment_path_amendment ON public.amendment_path USING btree (amendment_id);

CREATE INDEX idx_amendment_path_segment_path ON public.amendment_path_segment USING btree (path_id);

CREATE INDEX idx_amendment_status ON public.amendment USING btree (status);

CREATE INDEX idx_amendment_support_vote_amendment ON public.amendment_support_vote USING btree (amendment_id);

CREATE INDEX idx_amendment_support_vote_user ON public.amendment_support_vote USING btree (user_id);

CREATE INDEX idx_amendment_vote_entry_amendment ON public.amendment_vote_entry USING btree (amendment_id);

CREATE INDEX idx_amendment_vote_entry_user ON public.amendment_vote_entry USING btree (user_id);

CREATE INDEX idx_blog_blogger_blog ON public.blog_blogger USING btree (blog_id);

CREATE INDEX idx_blog_blogger_user ON public.blog_blogger USING btree (user_id);

CREATE INDEX idx_blog_group ON public.blog USING btree (group_id);

CREATE INDEX idx_blog_hashtag_blog ON public.blog_hashtag USING btree (blog_id);

CREATE INDEX idx_blog_hashtag_hashtag ON public.blog_hashtag USING btree (hashtag_id);

CREATE INDEX idx_blog_support_vote_blog ON public.blog_support_vote USING btree (blog_id);

CREATE INDEX idx_blog_support_vote_user ON public.blog_support_vote USING btree (user_id);

CREATE INDEX idx_calendar_sub_user ON public.calendar_subscription USING btree (user_id);

CREATE UNIQUE INDEX idx_calendar_sub_user_group ON public.calendar_subscription USING btree (user_id, target_group_id) WHERE (target_group_id IS NOT NULL);

CREATE UNIQUE INDEX idx_calendar_sub_user_user ON public.calendar_subscription USING btree (user_id, target_user_id) WHERE (target_user_id IS NOT NULL);

CREATE INDEX idx_change_request_amendment ON public.change_request USING btree (amendment_id);

CREATE INDEX idx_change_request_user ON public.change_request USING btree (user_id);

CREATE INDEX idx_change_request_vote_cr ON public.change_request_vote USING btree (change_request_id);

CREATE INDEX idx_change_request_vote_user ON public.change_request_vote USING btree (user_id);

CREATE INDEX idx_comment_parent ON public.comment USING btree (parent_id);

CREATE INDEX idx_comment_thread ON public.comment USING btree (thread_id);

CREATE INDEX idx_comment_user ON public.comment USING btree (user_id);

CREATE INDEX idx_comment_vote_comment ON public.comment_vote USING btree (comment_id);

CREATE INDEX idx_comment_vote_user ON public.comment_vote USING btree (user_id);

CREATE INDEX idx_conversation_group ON public.conversation USING btree (group_id);

CREATE INDEX idx_conversation_participant_conversation ON public.conversation_participant USING btree (conversation_id);

CREATE INDEX idx_conversation_participant_user ON public.conversation_participant USING btree (user_id);

CREATE INDEX idx_conversation_requested_by ON public.conversation USING btree (requested_by_id);

CREATE INDEX idx_document_amendment ON public.document USING btree (amendment_id);

CREATE INDEX idx_document_collaborator_document ON public.document_collaborator USING btree (document_id);

CREATE INDEX idx_document_collaborator_user ON public.document_collaborator USING btree (user_id);

CREATE INDEX idx_document_cursor_document ON public.document_cursor USING btree (document_id);

CREATE INDEX idx_document_version_author ON public.document_version USING btree (author_id);

CREATE INDEX idx_document_version_document ON public.document_version USING btree (document_id);

CREATE INDEX idx_election_agenda_item ON public.election USING btree (agenda_item_id);

CREATE INDEX idx_election_candidate_election ON public.election_candidate USING btree (election_id);

CREATE INDEX idx_election_candidate_user ON public.election_candidate USING btree (user_id);

CREATE INDEX idx_elector_election ON public.elector USING btree (election_id);

CREATE INDEX idx_elector_user ON public.elector USING btree (user_id);

CREATE INDEX idx_event_creator ON public.event USING btree (creator_id);

CREATE INDEX idx_event_delegate_event ON public.event_delegate USING btree (event_id);

CREATE INDEX idx_event_delegate_user ON public.event_delegate USING btree (user_id);

CREATE INDEX idx_event_exception_parent ON public.event_exception USING btree (parent_event_id);

CREATE INDEX idx_event_group ON public.event USING btree (group_id);

CREATE INDEX idx_event_hashtag_event ON public.event_hashtag USING btree (event_id);

CREATE INDEX idx_event_hashtag_hashtag ON public.event_hashtag USING btree (hashtag_id);

CREATE INDEX idx_event_participant_event ON public.event_participant USING btree (event_id);

CREATE INDEX idx_event_participant_instance ON public.event_participant USING btree (event_id, instance_date);

CREATE INDEX idx_event_participant_user ON public.event_participant USING btree (user_id);

CREATE INDEX idx_event_position_event ON public.event_position USING btree (event_id);

CREATE INDEX idx_event_position_holder_position ON public.event_position_holder USING btree (position_id);

CREATE INDEX idx_event_start_date ON public.event USING btree (start_date);

CREATE INDEX idx_event_status ON public.event USING btree (status);

CREATE INDEX idx_final_candidate_selection_candidate ON public.final_candidate_selection USING btree (candidate_id);

CREATE INDEX idx_final_candidate_selection_election ON public.final_candidate_selection USING btree (election_id);

CREATE INDEX idx_final_candidate_selection_participation ON public.final_candidate_selection USING btree (elector_participation_id);

CREATE INDEX idx_final_choice_decision_choice ON public.final_choice_decision USING btree (choice_id);

CREATE INDEX idx_final_choice_decision_participation ON public.final_choice_decision USING btree (voter_participation_id);

CREATE INDEX idx_final_choice_decision_vote ON public.final_choice_decision USING btree (vote_id);

CREATE INDEX idx_final_elector_participation_election ON public.final_elector_participation USING btree (election_id);

CREATE INDEX idx_final_elector_participation_elector ON public.final_elector_participation USING btree (elector_id);

CREATE INDEX idx_final_voter_participation_vote ON public.final_voter_participation USING btree (vote_id);

CREATE INDEX idx_final_voter_participation_voter ON public.final_voter_participation USING btree (voter_id);

CREATE INDEX idx_follow_followee ON public.follow USING btree (followee_id);

CREATE INDEX idx_follow_follower ON public.follow USING btree (follower_id);

CREATE INDEX idx_group_delegate_allocation_event ON public.group_delegate_allocation USING btree (event_id);

CREATE INDEX idx_group_hashtag_group ON public.group_hashtag USING btree (group_id);

CREATE INDEX idx_group_hashtag_hashtag ON public.group_hashtag USING btree (hashtag_id);

CREATE INDEX idx_group_membership_group ON public.group_membership USING btree (group_id);

CREATE INDEX idx_group_membership_source_group ON public.group_membership USING btree (source_group_id);

CREATE INDEX idx_group_membership_user ON public.group_membership USING btree (user_id);

CREATE INDEX idx_group_owner ON public."group" USING btree (owner_id);

CREATE INDEX idx_group_relationship_group ON public.group_relationship USING btree (group_id);

CREATE INDEX idx_group_relationship_related ON public.group_relationship USING btree (related_group_id);

CREATE UNIQUE INDEX idx_hashtag_tag ON public.hashtag USING btree (tag);

CREATE INDEX idx_indicative_candidate_selection_candidate ON public.indicative_candidate_selection USING btree (candidate_id);

CREATE INDEX idx_indicative_candidate_selection_election ON public.indicative_candidate_selection USING btree (election_id);

CREATE INDEX idx_indicative_candidate_selection_participation ON public.indicative_candidate_selection USING btree (elector_participation_id);

CREATE INDEX idx_indicative_choice_decision_choice ON public.indicative_choice_decision USING btree (choice_id);

CREATE INDEX idx_indicative_choice_decision_participation ON public.indicative_choice_decision USING btree (voter_participation_id);

CREATE INDEX idx_indicative_choice_decision_vote ON public.indicative_choice_decision USING btree (vote_id);

CREATE INDEX idx_indicative_elector_participation_election ON public.indicative_elector_participation USING btree (election_id);

CREATE INDEX idx_indicative_elector_participation_elector ON public.indicative_elector_participation USING btree (elector_id);

CREATE INDEX idx_indicative_voter_participation_vote ON public.indicative_voter_participation USING btree (vote_id);

CREATE INDEX idx_indicative_voter_participation_voter ON public.indicative_voter_participation USING btree (voter_id);

CREATE INDEX idx_link_group ON public.link USING btree (group_id);

CREATE INDEX idx_link_user ON public.link USING btree (user_id);

CREATE INDEX idx_meeting_booking_slot ON public.meeting_booking USING btree (slot_id);

CREATE INDEX idx_meeting_booking_user ON public.meeting_booking USING btree (user_id);

CREATE INDEX idx_meeting_slot_event ON public.meeting_slot USING btree (event_id);

CREATE INDEX idx_meeting_slot_user ON public.meeting_slot USING btree (user_id);

CREATE INDEX idx_message_conversation ON public.message USING btree (conversation_id);

CREATE INDEX idx_message_sender ON public.message USING btree (sender_id);

CREATE INDEX idx_notification_category ON public.notification USING btree (category);

CREATE INDEX idx_notification_is_read ON public.notification USING btree (is_read);

CREATE INDEX idx_notification_read_entity ON public.notification_read USING btree (entity_type, entity_id);

CREATE INDEX idx_notification_recipient ON public.notification USING btree (recipient_id);

CREATE INDEX idx_notification_recipient_entity ON public.notification USING btree (recipient_entity_id, created_at);

CREATE INDEX idx_notification_recipient_group ON public.notification USING btree (recipient_group_id, created_at);

CREATE INDEX idx_notification_recipient_read ON public.notification USING btree (recipient_id, is_read);

CREATE INDEX idx_notification_sender ON public.notification USING btree (sender_id);

CREATE INDEX idx_participant_event ON public.participant USING btree (event_id);

CREATE INDEX idx_participant_user ON public.participant USING btree (user_id);

CREATE INDEX idx_payment_payer_user ON public.payment USING btree (payer_user_id);

CREATE INDEX idx_payment_receiver_user ON public.payment USING btree (receiver_user_id);

CREATE INDEX idx_position_group ON public."position" USING btree (group_id);

CREATE INDEX idx_position_holder_history_position ON public.position_holder_history USING btree (position_id);

CREATE INDEX idx_position_holder_history_user ON public.position_holder_history USING btree (user_id);

CREATE INDEX idx_push_subscription_user ON public.push_subscription USING btree (user_id);

CREATE INDEX idx_reaction_entity ON public.reaction USING btree (entity_type, entity_id);

CREATE INDEX idx_reaction_timeline ON public.reaction USING btree (timeline_event_id);

CREATE INDEX idx_reaction_user ON public.reaction USING btree (user_id);

CREATE INDEX idx_role_group ON public.role USING btree (group_id);

CREATE INDEX idx_speaker_list_agenda_item ON public.speaker_list USING btree (agenda_item_id);

CREATE INDEX idx_statement_group ON public.statement USING btree (group_id);

CREATE INDEX idx_statement_hashtag_hashtag ON public.statement_hashtag USING btree (hashtag_id);

CREATE INDEX idx_statement_hashtag_statement ON public.statement_hashtag USING btree (statement_id);

CREATE INDEX idx_statement_support_vote_statement ON public.statement_support_vote USING btree (statement_id);

CREATE INDEX idx_statement_support_vote_user ON public.statement_support_vote USING btree (user_id);

CREATE INDEX idx_statement_survey_option_survey ON public.statement_survey_option USING btree (survey_id);

CREATE INDEX idx_statement_survey_statement ON public.statement_survey USING btree (statement_id);

CREATE INDEX idx_statement_survey_vote_option ON public.statement_survey_vote USING btree (option_id);

CREATE INDEX idx_statement_survey_vote_user ON public.statement_survey_vote USING btree (user_id);

CREATE INDEX idx_statement_user ON public.statement USING btree (user_id);

CREATE INDEX idx_stripe_payment_customer ON public.stripe_payment USING btree (customer_id);

CREATE INDEX idx_stripe_subscription_customer ON public.stripe_subscription USING btree (customer_id);

CREATE INDEX idx_subscriber_group ON public.subscriber USING btree (group_id);

CREATE INDEX idx_subscriber_subscriber ON public.subscriber USING btree (subscriber_id);

CREATE INDEX idx_subscriber_user ON public.subscriber USING btree (user_id);

CREATE INDEX idx_support_confirmation_amendment ON public.support_confirmation USING btree (amendment_id);

CREATE INDEX idx_support_confirmation_user ON public.support_confirmation USING btree (confirmed_by_id);

CREATE INDEX idx_thread_blog ON public.thread USING btree (blog_id);

CREATE INDEX idx_thread_document ON public.thread USING btree (document_id);

CREATE INDEX idx_thread_statement ON public.thread USING btree (statement_id);

CREATE INDEX idx_thread_user ON public.thread USING btree (user_id);

CREATE INDEX idx_thread_vote_thread ON public.thread_vote USING btree (thread_id);

CREATE INDEX idx_thread_vote_user ON public.thread_vote USING btree (user_id);

CREATE INDEX idx_timeline_event_created ON public.timeline_event USING btree (created_at);

CREATE INDEX idx_timeline_event_entity ON public.timeline_event USING btree (entity_type, entity_id);

CREATE INDEX idx_timeline_event_group ON public.timeline_event USING btree (group_id);

CREATE INDEX idx_timeline_event_user ON public.timeline_event USING btree (user_id);

CREATE INDEX idx_todo_assignment_todo ON public.todo_assignment USING btree (todo_id);

CREATE INDEX idx_todo_assignment_user ON public.todo_assignment USING btree (user_id);

CREATE INDEX idx_todo_creator ON public.todo USING btree (creator_id);

CREATE INDEX idx_todo_group ON public.todo USING btree (group_id);

CREATE INDEX idx_todo_status ON public.todo USING btree (status);

CREATE INDEX idx_user_email ON public."user" USING btree (email);

CREATE UNIQUE INDEX idx_user_handle ON public."user" USING btree (handle);

CREATE INDEX idx_user_hashtag_hashtag ON public.user_hashtag USING btree (hashtag_id);

CREATE INDEX idx_user_hashtag_user ON public.user_hashtag USING btree (user_id);

CREATE INDEX idx_user_preference_user ON public.user_preference USING btree (user_id);

CREATE INDEX idx_vote_agenda_item ON public.vote USING btree (agenda_item_id);

CREATE INDEX idx_vote_amendment ON public.vote USING btree (amendment_id);

CREATE INDEX idx_vote_choice_vote ON public.vote_choice USING btree (vote_id);

CREATE INDEX idx_voter_user ON public.voter USING btree (user_id);

CREATE INDEX idx_voter_vote ON public.voter USING btree (vote_id);

CREATE INDEX idx_voting_password_user ON public.voting_password USING btree (user_id);

CREATE UNIQUE INDEX indicative_candidate_selection_pkey ON public.indicative_candidate_selection USING btree (id);

CREATE UNIQUE INDEX indicative_choice_decision_pkey ON public.indicative_choice_decision USING btree (id);

CREATE UNIQUE INDEX indicative_elector_participation_election_id_elector_id_key ON public.indicative_elector_participation USING btree (election_id, elector_id);

CREATE UNIQUE INDEX indicative_elector_participation_pkey ON public.indicative_elector_participation USING btree (id);

CREATE UNIQUE INDEX indicative_voter_participation_pkey ON public.indicative_voter_participation USING btree (id);

CREATE UNIQUE INDEX indicative_voter_participation_vote_id_voter_id_key ON public.indicative_voter_participation USING btree (vote_id, voter_id);

CREATE UNIQUE INDEX link_pkey ON public.link USING btree (id);

CREATE UNIQUE INDEX meeting_booking_pkey ON public.meeting_booking USING btree (id);

CREATE UNIQUE INDEX meeting_slot_pkey ON public.meeting_slot USING btree (id);

CREATE UNIQUE INDEX message_pkey ON public.message USING btree (id);

CREATE UNIQUE INDEX notification_pkey ON public.notification USING btree (id);

CREATE UNIQUE INDEX notification_read_notification_id_entity_type_entity_id_key ON public.notification_read USING btree (notification_id, entity_type, entity_id);

CREATE UNIQUE INDEX notification_read_pkey ON public.notification_read USING btree (id);

CREATE UNIQUE INDEX notification_setting_pkey ON public.notification_setting USING btree (id);

CREATE UNIQUE INDEX notification_setting_user_id_key ON public.notification_setting USING btree (user_id);

CREATE UNIQUE INDEX participant_pkey ON public.participant USING btree (id);

CREATE UNIQUE INDEX payment_pkey ON public.payment USING btree (id);

CREATE UNIQUE INDEX position_holder_history_pkey ON public.position_holder_history USING btree (id);

CREATE UNIQUE INDEX position_pkey ON public."position" USING btree (id);

CREATE UNIQUE INDEX push_subscription_endpoint_key ON public.push_subscription USING btree (endpoint);

CREATE UNIQUE INDEX push_subscription_pkey ON public.push_subscription USING btree (id);

CREATE UNIQUE INDEX reaction_pkey ON public.reaction USING btree (id);

CREATE UNIQUE INDEX role_pkey ON public.role USING btree (id);

CREATE UNIQUE INDEX speaker_list_pkey ON public.speaker_list USING btree (id);

CREATE UNIQUE INDEX statement_hashtag_pkey ON public.statement_hashtag USING btree (id);

CREATE UNIQUE INDEX statement_hashtag_statement_id_hashtag_id_key ON public.statement_hashtag USING btree (statement_id, hashtag_id);

CREATE UNIQUE INDEX statement_pkey ON public.statement USING btree (id);

CREATE UNIQUE INDEX statement_support_vote_pkey ON public.statement_support_vote USING btree (id);

CREATE UNIQUE INDEX statement_survey_option_pkey ON public.statement_survey_option USING btree (id);

CREATE UNIQUE INDEX statement_survey_pkey ON public.statement_survey USING btree (id);

CREATE UNIQUE INDEX statement_survey_statement_id_key ON public.statement_survey USING btree (statement_id);

CREATE UNIQUE INDEX statement_survey_vote_option_id_user_id_key ON public.statement_survey_vote USING btree (option_id, user_id);

CREATE UNIQUE INDEX statement_survey_vote_pkey ON public.statement_survey_vote USING btree (id);

CREATE UNIQUE INDEX stripe_customer_pkey ON public.stripe_customer USING btree (id);

CREATE UNIQUE INDEX stripe_customer_stripe_customer_id_key ON public.stripe_customer USING btree (stripe_customer_id);

CREATE UNIQUE INDEX stripe_customer_user_id_key ON public.stripe_customer USING btree (user_id);

CREATE UNIQUE INDEX stripe_payment_pkey ON public.stripe_payment USING btree (id);

CREATE UNIQUE INDEX stripe_payment_stripe_invoice_id_key ON public.stripe_payment USING btree (stripe_invoice_id);

CREATE UNIQUE INDEX stripe_subscription_pkey ON public.stripe_subscription USING btree (id);

CREATE UNIQUE INDEX stripe_subscription_stripe_subscription_id_key ON public.stripe_subscription USING btree (stripe_subscription_id);

CREATE UNIQUE INDEX subscriber_pkey ON public.subscriber USING btree (id);

CREATE UNIQUE INDEX support_confirmation_pkey ON public.support_confirmation USING btree (id);

CREATE UNIQUE INDEX thread_pkey ON public.thread USING btree (id);

CREATE UNIQUE INDEX thread_vote_pkey ON public.thread_vote USING btree (id);

CREATE UNIQUE INDEX timeline_event_pkey ON public.timeline_event USING btree (id);

CREATE UNIQUE INDEX todo_assignment_pkey ON public.todo_assignment USING btree (id);

CREATE UNIQUE INDEX todo_pkey ON public.todo USING btree (id);

CREATE UNIQUE INDEX uq_event_exception_parent_date ON public.event_exception USING btree (parent_event_id, original_date);

CREATE UNIQUE INDEX user_hashtag_pkey ON public.user_hashtag USING btree (id);

CREATE UNIQUE INDEX user_hashtag_user_id_hashtag_id_key ON public.user_hashtag USING btree (user_id, hashtag_id);

CREATE UNIQUE INDEX user_pkey ON public."user" USING btree (id);

CREATE UNIQUE INDEX user_preference_pkey ON public.user_preference USING btree (id);

CREATE UNIQUE INDEX user_preference_user_id_key ON public.user_preference USING btree (user_id);

CREATE UNIQUE INDEX vote_choice_pkey ON public.vote_choice USING btree (id);

CREATE UNIQUE INDEX vote_pkey ON public.vote USING btree (id);

CREATE UNIQUE INDEX voter_pkey ON public.voter USING btree (id);

CREATE UNIQUE INDEX voter_vote_id_user_id_key ON public.voter USING btree (vote_id, user_id);

CREATE UNIQUE INDEX voting_password_pkey ON public.voting_password USING btree (id);

CREATE UNIQUE INDEX voting_password_user_id_key ON public.voting_password USING btree (user_id);

alter table "public"."accreditation" add constraint "accreditation_pkey" PRIMARY KEY using index "accreditation_pkey";

alter table "public"."action_right" add constraint "action_right_pkey" PRIMARY KEY using index "action_right_pkey";

alter table "public"."agenda_item" add constraint "agenda_item_pkey" PRIMARY KEY using index "agenda_item_pkey";

alter table "public"."amendment" add constraint "amendment_pkey" PRIMARY KEY using index "amendment_pkey";

alter table "public"."amendment_collaborator" add constraint "amendment_collaborator_pkey" PRIMARY KEY using index "amendment_collaborator_pkey";

alter table "public"."amendment_hashtag" add constraint "amendment_hashtag_pkey" PRIMARY KEY using index "amendment_hashtag_pkey";

alter table "public"."amendment_path" add constraint "amendment_path_pkey" PRIMARY KEY using index "amendment_path_pkey";

alter table "public"."amendment_path_segment" add constraint "amendment_path_segment_pkey" PRIMARY KEY using index "amendment_path_segment_pkey";

alter table "public"."amendment_support_vote" add constraint "amendment_support_vote_pkey" PRIMARY KEY using index "amendment_support_vote_pkey";

alter table "public"."amendment_vote_entry" add constraint "amendment_vote_entry_pkey" PRIMARY KEY using index "amendment_vote_entry_pkey";

alter table "public"."blog" add constraint "blog_pkey" PRIMARY KEY using index "blog_pkey";

alter table "public"."blog_blogger" add constraint "blog_blogger_pkey" PRIMARY KEY using index "blog_blogger_pkey";

alter table "public"."blog_hashtag" add constraint "blog_hashtag_pkey" PRIMARY KEY using index "blog_hashtag_pkey";

alter table "public"."blog_support_vote" add constraint "blog_support_vote_pkey" PRIMARY KEY using index "blog_support_vote_pkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_pkey" PRIMARY KEY using index "calendar_subscription_pkey";

alter table "public"."change_request" add constraint "change_request_pkey" PRIMARY KEY using index "change_request_pkey";

alter table "public"."change_request_vote" add constraint "change_request_vote_pkey" PRIMARY KEY using index "change_request_vote_pkey";

alter table "public"."comment" add constraint "comment_pkey" PRIMARY KEY using index "comment_pkey";

alter table "public"."comment_vote" add constraint "comment_vote_pkey" PRIMARY KEY using index "comment_vote_pkey";

alter table "public"."conversation" add constraint "conversation_pkey" PRIMARY KEY using index "conversation_pkey";

alter table "public"."conversation_participant" add constraint "conversation_participant_pkey" PRIMARY KEY using index "conversation_participant_pkey";

alter table "public"."document" add constraint "document_pkey" PRIMARY KEY using index "document_pkey";

alter table "public"."document_collaborator" add constraint "document_collaborator_pkey" PRIMARY KEY using index "document_collaborator_pkey";

alter table "public"."document_cursor" add constraint "document_cursor_pkey" PRIMARY KEY using index "document_cursor_pkey";

alter table "public"."document_version" add constraint "document_version_pkey" PRIMARY KEY using index "document_version_pkey";

alter table "public"."election" add constraint "election_pkey" PRIMARY KEY using index "election_pkey";

alter table "public"."election_candidate" add constraint "election_candidate_pkey" PRIMARY KEY using index "election_candidate_pkey";

alter table "public"."elector" add constraint "elector_pkey" PRIMARY KEY using index "elector_pkey";

alter table "public"."event" add constraint "event_pkey" PRIMARY KEY using index "event_pkey";

alter table "public"."event_delegate" add constraint "event_delegate_pkey" PRIMARY KEY using index "event_delegate_pkey";

alter table "public"."event_exception" add constraint "event_exception_pkey" PRIMARY KEY using index "event_exception_pkey";

alter table "public"."event_hashtag" add constraint "event_hashtag_pkey" PRIMARY KEY using index "event_hashtag_pkey";

alter table "public"."event_participant" add constraint "event_participant_pkey" PRIMARY KEY using index "event_participant_pkey";

alter table "public"."event_position" add constraint "event_position_pkey" PRIMARY KEY using index "event_position_pkey";

alter table "public"."event_position_holder" add constraint "event_position_holder_pkey" PRIMARY KEY using index "event_position_holder_pkey";

alter table "public"."file" add constraint "file_pkey" PRIMARY KEY using index "file_pkey";

alter table "public"."final_candidate_selection" add constraint "final_candidate_selection_pkey" PRIMARY KEY using index "final_candidate_selection_pkey";

alter table "public"."final_choice_decision" add constraint "final_choice_decision_pkey" PRIMARY KEY using index "final_choice_decision_pkey";

alter table "public"."final_elector_participation" add constraint "final_elector_participation_pkey" PRIMARY KEY using index "final_elector_participation_pkey";

alter table "public"."final_voter_participation" add constraint "final_voter_participation_pkey" PRIMARY KEY using index "final_voter_participation_pkey";

alter table "public"."follow" add constraint "follow_pkey" PRIMARY KEY using index "follow_pkey";

alter table "public"."group" add constraint "group_pkey" PRIMARY KEY using index "group_pkey";

alter table "public"."group_delegate_allocation" add constraint "group_delegate_allocation_pkey" PRIMARY KEY using index "group_delegate_allocation_pkey";

alter table "public"."group_hashtag" add constraint "group_hashtag_pkey" PRIMARY KEY using index "group_hashtag_pkey";

alter table "public"."group_membership" add constraint "group_membership_pkey" PRIMARY KEY using index "group_membership_pkey";

alter table "public"."group_relationship" add constraint "group_relationship_pkey" PRIMARY KEY using index "group_relationship_pkey";

alter table "public"."hashtag" add constraint "hashtag_pkey" PRIMARY KEY using index "hashtag_pkey";

alter table "public"."indicative_candidate_selection" add constraint "indicative_candidate_selection_pkey" PRIMARY KEY using index "indicative_candidate_selection_pkey";

alter table "public"."indicative_choice_decision" add constraint "indicative_choice_decision_pkey" PRIMARY KEY using index "indicative_choice_decision_pkey";

alter table "public"."indicative_elector_participation" add constraint "indicative_elector_participation_pkey" PRIMARY KEY using index "indicative_elector_participation_pkey";

alter table "public"."indicative_voter_participation" add constraint "indicative_voter_participation_pkey" PRIMARY KEY using index "indicative_voter_participation_pkey";

alter table "public"."link" add constraint "link_pkey" PRIMARY KEY using index "link_pkey";

alter table "public"."meeting_booking" add constraint "meeting_booking_pkey" PRIMARY KEY using index "meeting_booking_pkey";

alter table "public"."meeting_slot" add constraint "meeting_slot_pkey" PRIMARY KEY using index "meeting_slot_pkey";

alter table "public"."message" add constraint "message_pkey" PRIMARY KEY using index "message_pkey";

alter table "public"."notification" add constraint "notification_pkey" PRIMARY KEY using index "notification_pkey";

alter table "public"."notification_read" add constraint "notification_read_pkey" PRIMARY KEY using index "notification_read_pkey";

alter table "public"."notification_setting" add constraint "notification_setting_pkey" PRIMARY KEY using index "notification_setting_pkey";

alter table "public"."participant" add constraint "participant_pkey" PRIMARY KEY using index "participant_pkey";

alter table "public"."payment" add constraint "payment_pkey" PRIMARY KEY using index "payment_pkey";

alter table "public"."position" add constraint "position_pkey" PRIMARY KEY using index "position_pkey";

alter table "public"."position_holder_history" add constraint "position_holder_history_pkey" PRIMARY KEY using index "position_holder_history_pkey";

alter table "public"."push_subscription" add constraint "push_subscription_pkey" PRIMARY KEY using index "push_subscription_pkey";

alter table "public"."reaction" add constraint "reaction_pkey" PRIMARY KEY using index "reaction_pkey";

alter table "public"."role" add constraint "role_pkey" PRIMARY KEY using index "role_pkey";

alter table "public"."speaker_list" add constraint "speaker_list_pkey" PRIMARY KEY using index "speaker_list_pkey";

alter table "public"."statement" add constraint "statement_pkey" PRIMARY KEY using index "statement_pkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_pkey" PRIMARY KEY using index "statement_hashtag_pkey";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_pkey" PRIMARY KEY using index "statement_support_vote_pkey";

alter table "public"."statement_survey" add constraint "statement_survey_pkey" PRIMARY KEY using index "statement_survey_pkey";

alter table "public"."statement_survey_option" add constraint "statement_survey_option_pkey" PRIMARY KEY using index "statement_survey_option_pkey";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_pkey" PRIMARY KEY using index "statement_survey_vote_pkey";

alter table "public"."stripe_customer" add constraint "stripe_customer_pkey" PRIMARY KEY using index "stripe_customer_pkey";

alter table "public"."stripe_payment" add constraint "stripe_payment_pkey" PRIMARY KEY using index "stripe_payment_pkey";

alter table "public"."stripe_subscription" add constraint "stripe_subscription_pkey" PRIMARY KEY using index "stripe_subscription_pkey";

alter table "public"."subscriber" add constraint "subscriber_pkey" PRIMARY KEY using index "subscriber_pkey";

alter table "public"."support_confirmation" add constraint "support_confirmation_pkey" PRIMARY KEY using index "support_confirmation_pkey";

alter table "public"."thread" add constraint "thread_pkey" PRIMARY KEY using index "thread_pkey";

alter table "public"."thread_vote" add constraint "thread_vote_pkey" PRIMARY KEY using index "thread_vote_pkey";

alter table "public"."timeline_event" add constraint "timeline_event_pkey" PRIMARY KEY using index "timeline_event_pkey";

alter table "public"."todo" add constraint "todo_pkey" PRIMARY KEY using index "todo_pkey";

alter table "public"."todo_assignment" add constraint "todo_assignment_pkey" PRIMARY KEY using index "todo_assignment_pkey";

alter table "public"."user" add constraint "user_pkey" PRIMARY KEY using index "user_pkey";

alter table "public"."user_hashtag" add constraint "user_hashtag_pkey" PRIMARY KEY using index "user_hashtag_pkey";

alter table "public"."user_preference" add constraint "user_preference_pkey" PRIMARY KEY using index "user_preference_pkey";

alter table "public"."vote" add constraint "vote_pkey" PRIMARY KEY using index "vote_pkey";

alter table "public"."vote_choice" add constraint "vote_choice_pkey" PRIMARY KEY using index "vote_choice_pkey";

alter table "public"."voter" add constraint "voter_pkey" PRIMARY KEY using index "voter_pkey";

alter table "public"."voting_password" add constraint "voting_password_pkey" PRIMARY KEY using index "voting_password_pkey";

alter table "public"."accreditation" add constraint "accreditation_agenda_item_id_fkey" FOREIGN KEY (agenda_item_id) REFERENCES public.agenda_item(id) ON DELETE CASCADE not valid;

alter table "public"."accreditation" validate constraint "accreditation_agenda_item_id_fkey";

alter table "public"."accreditation" add constraint "accreditation_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."accreditation" validate constraint "accreditation_event_id_fkey";

alter table "public"."accreditation" add constraint "accreditation_event_id_user_id_key" UNIQUE using index "accreditation_event_id_user_id_key";

alter table "public"."accreditation" add constraint "accreditation_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."accreditation" validate constraint "accreditation_user_id_fkey";

alter table "public"."action_right" add constraint "action_right_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE not valid;

alter table "public"."action_right" validate constraint "action_right_role_id_fkey";

alter table "public"."agenda_item" add constraint "agenda_item_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."agenda_item" validate constraint "agenda_item_creator_id_fkey";

alter table "public"."amendment" add constraint "amendment_created_by_id_fkey" FOREIGN KEY (created_by_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."amendment" validate constraint "amendment_created_by_id_fkey";

alter table "public"."amendment" add constraint "amendment_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.document(id) ON DELETE SET NULL not valid;

alter table "public"."amendment" validate constraint "amendment_document_id_fkey";

alter table "public"."amendment_collaborator" add constraint "amendment_collaborator_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_collaborator" validate constraint "amendment_collaborator_amendment_id_fkey";

alter table "public"."amendment_collaborator" add constraint "amendment_collaborator_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE SET NULL not valid;

alter table "public"."amendment_collaborator" validate constraint "amendment_collaborator_role_id_fkey";

alter table "public"."amendment_collaborator" add constraint "amendment_collaborator_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_collaborator" validate constraint "amendment_collaborator_user_id_fkey";

alter table "public"."amendment_hashtag" add constraint "amendment_hashtag_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_hashtag" validate constraint "amendment_hashtag_amendment_id_fkey";

alter table "public"."amendment_hashtag" add constraint "amendment_hashtag_amendment_id_hashtag_id_key" UNIQUE using index "amendment_hashtag_amendment_id_hashtag_id_key";

alter table "public"."amendment_hashtag" add constraint "amendment_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_hashtag" validate constraint "amendment_hashtag_hashtag_id_fkey";

alter table "public"."amendment_path" add constraint "amendment_path_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_path" validate constraint "amendment_path_amendment_id_fkey";

alter table "public"."amendment_path_segment" add constraint "amendment_path_segment_path_id_fkey" FOREIGN KEY (path_id) REFERENCES public.amendment_path(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_path_segment" validate constraint "amendment_path_segment_path_id_fkey";

alter table "public"."amendment_support_vote" add constraint "amendment_support_vote_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_support_vote" validate constraint "amendment_support_vote_amendment_id_fkey";

alter table "public"."amendment_support_vote" add constraint "amendment_support_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_support_vote" validate constraint "amendment_support_vote_user_id_fkey";

alter table "public"."amendment_vote_entry" add constraint "amendment_vote_entry_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_vote_entry" validate constraint "amendment_vote_entry_amendment_id_fkey";

alter table "public"."amendment_vote_entry" add constraint "amendment_vote_entry_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."amendment_vote_entry" validate constraint "amendment_vote_entry_user_id_fkey";

alter table "public"."blog_blogger" add constraint "blog_blogger_blog_id_fkey" FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE not valid;

alter table "public"."blog_blogger" validate constraint "blog_blogger_blog_id_fkey";

alter table "public"."blog_blogger" add constraint "blog_blogger_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE SET NULL not valid;

alter table "public"."blog_blogger" validate constraint "blog_blogger_role_id_fkey";

alter table "public"."blog_blogger" add constraint "blog_blogger_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."blog_blogger" validate constraint "blog_blogger_user_id_fkey";

alter table "public"."blog_hashtag" add constraint "blog_hashtag_blog_id_fkey" FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE not valid;

alter table "public"."blog_hashtag" validate constraint "blog_hashtag_blog_id_fkey";

alter table "public"."blog_hashtag" add constraint "blog_hashtag_blog_id_hashtag_id_key" UNIQUE using index "blog_hashtag_blog_id_hashtag_id_key";

alter table "public"."blog_hashtag" add constraint "blog_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."blog_hashtag" validate constraint "blog_hashtag_hashtag_id_fkey";

alter table "public"."blog_support_vote" add constraint "blog_support_vote_blog_id_fkey" FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE not valid;

alter table "public"."blog_support_vote" validate constraint "blog_support_vote_blog_id_fkey";

alter table "public"."blog_support_vote" add constraint "blog_support_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."blog_support_vote" validate constraint "blog_support_vote_user_id_fkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_target_group_id_fkey" FOREIGN KEY (target_group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_subscription" validate constraint "calendar_subscription_target_group_id_fkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_subscription" validate constraint "calendar_subscription_target_user_id_fkey";

alter table "public"."calendar_subscription" add constraint "calendar_subscription_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."calendar_subscription" validate constraint "calendar_subscription_user_id_fkey";

alter table "public"."calendar_subscription" add constraint "chk_calendar_sub_target" CHECK ((((target_type = 'group'::text) AND (target_group_id IS NOT NULL) AND (target_user_id IS NULL)) OR ((target_type = 'user'::text) AND (target_user_id IS NOT NULL) AND (target_group_id IS NULL)))) not valid;

alter table "public"."calendar_subscription" validate constraint "chk_calendar_sub_target";

alter table "public"."change_request" add constraint "change_request_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."change_request" validate constraint "change_request_amendment_id_fkey";

alter table "public"."change_request" add constraint "change_request_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."change_request" validate constraint "change_request_user_id_fkey";

alter table "public"."change_request_vote" add constraint "change_request_vote_change_request_id_fkey" FOREIGN KEY (change_request_id) REFERENCES public.change_request(id) ON DELETE CASCADE not valid;

alter table "public"."change_request_vote" validate constraint "change_request_vote_change_request_id_fkey";

alter table "public"."change_request_vote" add constraint "change_request_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."change_request_vote" validate constraint "change_request_vote_user_id_fkey";

alter table "public"."comment" add constraint "comment_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.comment(id) ON DELETE CASCADE not valid;

alter table "public"."comment" validate constraint "comment_parent_id_fkey";

alter table "public"."comment" add constraint "comment_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.thread(id) ON DELETE CASCADE not valid;

alter table "public"."comment" validate constraint "comment_thread_id_fkey";

alter table "public"."comment" add constraint "comment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."comment" validate constraint "comment_user_id_fkey";

alter table "public"."comment_vote" add constraint "comment_vote_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comment(id) ON DELETE CASCADE not valid;

alter table "public"."comment_vote" validate constraint "comment_vote_comment_id_fkey";

alter table "public"."comment_vote" add constraint "comment_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."comment_vote" validate constraint "comment_vote_user_id_fkey";

alter table "public"."conversation" add constraint "conversation_requested_by_id_fkey" FOREIGN KEY (requested_by_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."conversation" validate constraint "conversation_requested_by_id_fkey";

alter table "public"."conversation_participant" add constraint "conversation_participant_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversation(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_participant" validate constraint "conversation_participant_conversation_id_fkey";

alter table "public"."conversation_participant" add constraint "conversation_participant_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_participant" validate constraint "conversation_participant_user_id_fkey";

alter table "public"."document_collaborator" add constraint "document_collaborator_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.document(id) ON DELETE CASCADE not valid;

alter table "public"."document_collaborator" validate constraint "document_collaborator_document_id_fkey";

alter table "public"."document_collaborator" add constraint "document_collaborator_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."document_collaborator" validate constraint "document_collaborator_user_id_fkey";

alter table "public"."document_cursor" add constraint "document_cursor_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.document(id) ON DELETE CASCADE not valid;

alter table "public"."document_cursor" validate constraint "document_cursor_document_id_fkey";

alter table "public"."document_cursor" add constraint "document_cursor_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."document_cursor" validate constraint "document_cursor_user_id_fkey";

alter table "public"."document_version" add constraint "document_version_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."document_version" validate constraint "document_version_author_id_fkey";

alter table "public"."document_version" add constraint "document_version_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.document(id) ON DELETE CASCADE not valid;

alter table "public"."document_version" validate constraint "document_version_document_id_fkey";

alter table "public"."election_candidate" add constraint "election_candidate_election_id_fkey" FOREIGN KEY (election_id) REFERENCES public.election(id) ON DELETE CASCADE not valid;

alter table "public"."election_candidate" validate constraint "election_candidate_election_id_fkey";

alter table "public"."election_candidate" add constraint "election_candidate_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."election_candidate" validate constraint "election_candidate_user_id_fkey";

alter table "public"."elector" add constraint "elector_election_id_fkey" FOREIGN KEY (election_id) REFERENCES public.election(id) ON DELETE CASCADE not valid;

alter table "public"."elector" validate constraint "elector_election_id_fkey";

alter table "public"."elector" add constraint "elector_election_id_user_id_key" UNIQUE using index "elector_election_id_user_id_key";

alter table "public"."elector" add constraint "elector_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."elector" validate constraint "elector_user_id_fkey";

alter table "public"."event" add constraint "event_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."event" validate constraint "event_creator_id_fkey";

alter table "public"."event_delegate" add constraint "event_delegate_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."event_delegate" validate constraint "event_delegate_event_id_fkey";

alter table "public"."event_delegate" add constraint "event_delegate_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."event_delegate" validate constraint "event_delegate_user_id_fkey";

alter table "public"."event_exception" add constraint "event_exception_parent_event_id_fkey" FOREIGN KEY (parent_event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."event_exception" validate constraint "event_exception_parent_event_id_fkey";

alter table "public"."event_exception" add constraint "uq_event_exception_parent_date" UNIQUE using index "uq_event_exception_parent_date";

alter table "public"."event_hashtag" add constraint "event_hashtag_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."event_hashtag" validate constraint "event_hashtag_event_id_fkey";

alter table "public"."event_hashtag" add constraint "event_hashtag_event_id_hashtag_id_key" UNIQUE using index "event_hashtag_event_id_hashtag_id_key";

alter table "public"."event_hashtag" add constraint "event_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."event_hashtag" validate constraint "event_hashtag_hashtag_id_fkey";

alter table "public"."event_participant" add constraint "event_participant_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."event_participant" validate constraint "event_participant_event_id_fkey";

alter table "public"."event_participant" add constraint "event_participant_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE SET NULL not valid;

alter table "public"."event_participant" validate constraint "event_participant_role_id_fkey";

alter table "public"."event_participant" add constraint "event_participant_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."event_participant" validate constraint "event_participant_user_id_fkey";

alter table "public"."event_position" add constraint "event_position_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."event_position" validate constraint "event_position_event_id_fkey";

alter table "public"."event_position_holder" add constraint "event_position_holder_position_id_fkey" FOREIGN KEY (position_id) REFERENCES public.event_position(id) ON DELETE CASCADE not valid;

alter table "public"."event_position_holder" validate constraint "event_position_holder_position_id_fkey";

alter table "public"."event_position_holder" add constraint "event_position_holder_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."event_position_holder" validate constraint "event_position_holder_user_id_fkey";

alter table "public"."final_candidate_selection" add constraint "final_candidate_selection_candidate_id_fkey" FOREIGN KEY (candidate_id) REFERENCES public.election_candidate(id) ON DELETE CASCADE not valid;

alter table "public"."final_candidate_selection" validate constraint "final_candidate_selection_candidate_id_fkey";

alter table "public"."final_candidate_selection" add constraint "final_candidate_selection_election_id_fkey" FOREIGN KEY (election_id) REFERENCES public.election(id) ON DELETE CASCADE not valid;

alter table "public"."final_candidate_selection" validate constraint "final_candidate_selection_election_id_fkey";

alter table "public"."final_candidate_selection" add constraint "final_candidate_selection_elector_participation_id_fkey" FOREIGN KEY (elector_participation_id) REFERENCES public.final_elector_participation(id) ON DELETE CASCADE not valid;

alter table "public"."final_candidate_selection" validate constraint "final_candidate_selection_elector_participation_id_fkey";

alter table "public"."final_choice_decision" add constraint "final_choice_decision_choice_id_fkey" FOREIGN KEY (choice_id) REFERENCES public.vote_choice(id) ON DELETE CASCADE not valid;

alter table "public"."final_choice_decision" validate constraint "final_choice_decision_choice_id_fkey";

alter table "public"."final_choice_decision" add constraint "final_choice_decision_vote_id_fkey" FOREIGN KEY (vote_id) REFERENCES public.vote(id) ON DELETE CASCADE not valid;

alter table "public"."final_choice_decision" validate constraint "final_choice_decision_vote_id_fkey";

alter table "public"."final_choice_decision" add constraint "final_choice_decision_voter_participation_id_fkey" FOREIGN KEY (voter_participation_id) REFERENCES public.final_voter_participation(id) ON DELETE CASCADE not valid;

alter table "public"."final_choice_decision" validate constraint "final_choice_decision_voter_participation_id_fkey";

alter table "public"."final_elector_participation" add constraint "final_elector_participation_election_id_elector_id_key" UNIQUE using index "final_elector_participation_election_id_elector_id_key";

alter table "public"."final_elector_participation" add constraint "final_elector_participation_election_id_fkey" FOREIGN KEY (election_id) REFERENCES public.election(id) ON DELETE CASCADE not valid;

alter table "public"."final_elector_participation" validate constraint "final_elector_participation_election_id_fkey";

alter table "public"."final_elector_participation" add constraint "final_elector_participation_elector_id_fkey" FOREIGN KEY (elector_id) REFERENCES public.elector(id) ON DELETE CASCADE not valid;

alter table "public"."final_elector_participation" validate constraint "final_elector_participation_elector_id_fkey";

alter table "public"."final_voter_participation" add constraint "final_voter_participation_vote_id_fkey" FOREIGN KEY (vote_id) REFERENCES public.vote(id) ON DELETE CASCADE not valid;

alter table "public"."final_voter_participation" validate constraint "final_voter_participation_vote_id_fkey";

alter table "public"."final_voter_participation" add constraint "final_voter_participation_vote_id_voter_id_key" UNIQUE using index "final_voter_participation_vote_id_voter_id_key";

alter table "public"."final_voter_participation" add constraint "final_voter_participation_voter_id_fkey" FOREIGN KEY (voter_id) REFERENCES public.voter(id) ON DELETE CASCADE not valid;

alter table "public"."final_voter_participation" validate constraint "final_voter_participation_voter_id_fkey";

alter table "public"."follow" add constraint "follow_followee_id_fkey" FOREIGN KEY (followee_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."follow" validate constraint "follow_followee_id_fkey";

alter table "public"."follow" add constraint "follow_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."follow" validate constraint "follow_follower_id_fkey";

alter table "public"."group" add constraint "group_group_type_check" CHECK ((group_type = ANY (ARRAY['base'::text, 'hierarchical'::text]))) not valid;

alter table "public"."group" validate constraint "group_group_type_check";

alter table "public"."group" add constraint "group_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."group" validate constraint "group_owner_id_fkey";

alter table "public"."group_delegate_allocation" add constraint "group_delegate_allocation_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."group_delegate_allocation" validate constraint "group_delegate_allocation_event_id_fkey";

alter table "public"."group_hashtag" add constraint "group_hashtag_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_hashtag" validate constraint "group_hashtag_group_id_fkey";

alter table "public"."group_hashtag" add constraint "group_hashtag_group_id_hashtag_id_key" UNIQUE using index "group_hashtag_group_id_hashtag_id_key";

alter table "public"."group_hashtag" add constraint "group_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."group_hashtag" validate constraint "group_hashtag_hashtag_id_fkey";

alter table "public"."group_membership" add constraint "group_membership_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_membership" validate constraint "group_membership_group_id_fkey";

alter table "public"."group_membership" add constraint "group_membership_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE SET NULL not valid;

alter table "public"."group_membership" validate constraint "group_membership_role_id_fkey";

alter table "public"."group_membership" add constraint "group_membership_source_group_id_fkey" FOREIGN KEY (source_group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_membership" validate constraint "group_membership_source_group_id_fkey";

alter table "public"."group_membership" add constraint "group_membership_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."group_membership" validate constraint "group_membership_user_id_fkey";

alter table "public"."group_membership" add constraint "group_membership_user_id_group_id_key" UNIQUE using index "group_membership_user_id_group_id_key";

alter table "public"."group_relationship" add constraint "group_relationship_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_relationship" validate constraint "group_relationship_group_id_fkey";

alter table "public"."group_relationship" add constraint "group_relationship_related_group_id_fkey" FOREIGN KEY (related_group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."group_relationship" validate constraint "group_relationship_related_group_id_fkey";

alter table "public"."indicative_candidate_selection" add constraint "indicative_candidate_selection_candidate_id_fkey" FOREIGN KEY (candidate_id) REFERENCES public.election_candidate(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_candidate_selection" validate constraint "indicative_candidate_selection_candidate_id_fkey";

alter table "public"."indicative_candidate_selection" add constraint "indicative_candidate_selection_election_id_fkey" FOREIGN KEY (election_id) REFERENCES public.election(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_candidate_selection" validate constraint "indicative_candidate_selection_election_id_fkey";

alter table "public"."indicative_candidate_selection" add constraint "indicative_candidate_selection_elector_participation_id_fkey" FOREIGN KEY (elector_participation_id) REFERENCES public.indicative_elector_participation(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_candidate_selection" validate constraint "indicative_candidate_selection_elector_participation_id_fkey";

alter table "public"."indicative_choice_decision" add constraint "indicative_choice_decision_choice_id_fkey" FOREIGN KEY (choice_id) REFERENCES public.vote_choice(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_choice_decision" validate constraint "indicative_choice_decision_choice_id_fkey";

alter table "public"."indicative_choice_decision" add constraint "indicative_choice_decision_vote_id_fkey" FOREIGN KEY (vote_id) REFERENCES public.vote(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_choice_decision" validate constraint "indicative_choice_decision_vote_id_fkey";

alter table "public"."indicative_choice_decision" add constraint "indicative_choice_decision_voter_participation_id_fkey" FOREIGN KEY (voter_participation_id) REFERENCES public.indicative_voter_participation(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_choice_decision" validate constraint "indicative_choice_decision_voter_participation_id_fkey";

alter table "public"."indicative_elector_participation" add constraint "indicative_elector_participation_election_id_elector_id_key" UNIQUE using index "indicative_elector_participation_election_id_elector_id_key";

alter table "public"."indicative_elector_participation" add constraint "indicative_elector_participation_election_id_fkey" FOREIGN KEY (election_id) REFERENCES public.election(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_elector_participation" validate constraint "indicative_elector_participation_election_id_fkey";

alter table "public"."indicative_elector_participation" add constraint "indicative_elector_participation_elector_id_fkey" FOREIGN KEY (elector_id) REFERENCES public.elector(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_elector_participation" validate constraint "indicative_elector_participation_elector_id_fkey";

alter table "public"."indicative_voter_participation" add constraint "indicative_voter_participation_vote_id_fkey" FOREIGN KEY (vote_id) REFERENCES public.vote(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_voter_participation" validate constraint "indicative_voter_participation_vote_id_fkey";

alter table "public"."indicative_voter_participation" add constraint "indicative_voter_participation_vote_id_voter_id_key" UNIQUE using index "indicative_voter_participation_vote_id_voter_id_key";

alter table "public"."indicative_voter_participation" add constraint "indicative_voter_participation_voter_id_fkey" FOREIGN KEY (voter_id) REFERENCES public.voter(id) ON DELETE CASCADE not valid;

alter table "public"."indicative_voter_participation" validate constraint "indicative_voter_participation_voter_id_fkey";

alter table "public"."meeting_booking" add constraint "meeting_booking_slot_id_fkey" FOREIGN KEY (slot_id) REFERENCES public.meeting_slot(id) ON DELETE CASCADE not valid;

alter table "public"."meeting_booking" validate constraint "meeting_booking_slot_id_fkey";

alter table "public"."meeting_booking" add constraint "meeting_booking_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."meeting_booking" validate constraint "meeting_booking_user_id_fkey";

alter table "public"."meeting_slot" add constraint "meeting_slot_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."meeting_slot" validate constraint "meeting_slot_event_id_fkey";

alter table "public"."meeting_slot" add constraint "meeting_slot_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."meeting_slot" validate constraint "meeting_slot_user_id_fkey";

alter table "public"."message" add constraint "message_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversation(id) ON DELETE CASCADE not valid;

alter table "public"."message" validate constraint "message_conversation_id_fkey";

alter table "public"."message" add constraint "message_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."message" validate constraint "message_sender_id_fkey";

alter table "public"."notification" add constraint "notification_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."notification" validate constraint "notification_recipient_id_fkey";

alter table "public"."notification" add constraint "notification_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."notification" validate constraint "notification_sender_id_fkey";

alter table "public"."notification_read" add constraint "notification_read_notification_id_entity_type_entity_id_key" UNIQUE using index "notification_read_notification_id_entity_type_entity_id_key";

alter table "public"."notification_read" add constraint "notification_read_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES public.notification(id) ON DELETE CASCADE not valid;

alter table "public"."notification_read" validate constraint "notification_read_notification_id_fkey";

alter table "public"."notification_read" add constraint "notification_read_read_by_user_id_fkey" FOREIGN KEY (read_by_user_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."notification_read" validate constraint "notification_read_read_by_user_id_fkey";

alter table "public"."notification_setting" add constraint "notification_setting_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."notification_setting" validate constraint "notification_setting_user_id_fkey";

alter table "public"."notification_setting" add constraint "notification_setting_user_id_key" UNIQUE using index "notification_setting_user_id_key";

alter table "public"."participant" add constraint "participant_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.event(id) ON DELETE CASCADE not valid;

alter table "public"."participant" validate constraint "participant_event_id_fkey";

alter table "public"."participant" add constraint "participant_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."participant" validate constraint "participant_user_id_fkey";

alter table "public"."payment" add constraint "payment_payer_user_id_fkey" FOREIGN KEY (payer_user_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."payment" validate constraint "payment_payer_user_id_fkey";

alter table "public"."payment" add constraint "payment_receiver_user_id_fkey" FOREIGN KEY (receiver_user_id) REFERENCES public."user"(id) ON DELETE SET NULL not valid;

alter table "public"."payment" validate constraint "payment_receiver_user_id_fkey";

alter table "public"."position" add constraint "position_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."position" validate constraint "position_group_id_fkey";

alter table "public"."position_holder_history" add constraint "position_holder_history_position_id_fkey" FOREIGN KEY (position_id) REFERENCES public."position"(id) ON DELETE CASCADE not valid;

alter table "public"."position_holder_history" validate constraint "position_holder_history_position_id_fkey";

alter table "public"."position_holder_history" add constraint "position_holder_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."position_holder_history" validate constraint "position_holder_history_user_id_fkey";

alter table "public"."push_subscription" add constraint "push_subscription_endpoint_key" UNIQUE using index "push_subscription_endpoint_key";

alter table "public"."push_subscription" add constraint "push_subscription_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."push_subscription" validate constraint "push_subscription_user_id_fkey";

alter table "public"."reaction" add constraint "reaction_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."reaction" validate constraint "reaction_user_id_fkey";

alter table "public"."role" add constraint "role_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE CASCADE not valid;

alter table "public"."role" validate constraint "role_group_id_fkey";

alter table "public"."speaker_list" add constraint "speaker_list_agenda_item_id_fkey" FOREIGN KEY (agenda_item_id) REFERENCES public.agenda_item(id) ON DELETE CASCADE not valid;

alter table "public"."speaker_list" validate constraint "speaker_list_agenda_item_id_fkey";

alter table "public"."speaker_list" add constraint "speaker_list_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."speaker_list" validate constraint "speaker_list_user_id_fkey";

alter table "public"."statement" add constraint "statement_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."group"(id) ON DELETE SET NULL not valid;

alter table "public"."statement" validate constraint "statement_group_id_fkey";

alter table "public"."statement" add constraint "statement_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."statement" validate constraint "statement_user_id_fkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."statement_hashtag" validate constraint "statement_hashtag_hashtag_id_fkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."statement_hashtag" validate constraint "statement_hashtag_statement_id_fkey";

alter table "public"."statement_hashtag" add constraint "statement_hashtag_statement_id_hashtag_id_key" UNIQUE using index "statement_hashtag_statement_id_hashtag_id_key";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."statement_support_vote" validate constraint "statement_support_vote_statement_id_fkey";

alter table "public"."statement_support_vote" add constraint "statement_support_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."statement_support_vote" validate constraint "statement_support_vote_user_id_fkey";

alter table "public"."statement_survey" add constraint "statement_survey_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey" validate constraint "statement_survey_statement_id_fkey";

alter table "public"."statement_survey" add constraint "statement_survey_statement_id_key" UNIQUE using index "statement_survey_statement_id_key";

alter table "public"."statement_survey_option" add constraint "statement_survey_option_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES public.statement_survey(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey_option" validate constraint "statement_survey_option_survey_id_fkey";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_option_id_fkey" FOREIGN KEY (option_id) REFERENCES public.statement_survey_option(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey_vote" validate constraint "statement_survey_vote_option_id_fkey";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_option_id_user_id_key" UNIQUE using index "statement_survey_vote_option_id_user_id_key";

alter table "public"."statement_survey_vote" add constraint "statement_survey_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."statement_survey_vote" validate constraint "statement_survey_vote_user_id_fkey";

alter table "public"."stripe_customer" add constraint "stripe_customer_stripe_customer_id_key" UNIQUE using index "stripe_customer_stripe_customer_id_key";

alter table "public"."stripe_customer" add constraint "stripe_customer_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."stripe_customer" validate constraint "stripe_customer_user_id_fkey";

alter table "public"."stripe_customer" add constraint "stripe_customer_user_id_key" UNIQUE using index "stripe_customer_user_id_key";

alter table "public"."stripe_payment" add constraint "stripe_payment_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.stripe_customer(id) ON DELETE CASCADE not valid;

alter table "public"."stripe_payment" validate constraint "stripe_payment_customer_id_fkey";

alter table "public"."stripe_payment" add constraint "stripe_payment_stripe_invoice_id_key" UNIQUE using index "stripe_payment_stripe_invoice_id_key";

alter table "public"."stripe_subscription" add constraint "stripe_subscription_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.stripe_customer(id) ON DELETE CASCADE not valid;

alter table "public"."stripe_subscription" validate constraint "stripe_subscription_customer_id_fkey";

alter table "public"."stripe_subscription" add constraint "stripe_subscription_stripe_subscription_id_key" UNIQUE using index "stripe_subscription_stripe_subscription_id_key";

alter table "public"."subscriber" add constraint "subscriber_subscriber_id_fkey" FOREIGN KEY (subscriber_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."subscriber" validate constraint "subscriber_subscriber_id_fkey";

alter table "public"."support_confirmation" add constraint "support_confirmation_amendment_id_fkey" FOREIGN KEY (amendment_id) REFERENCES public.amendment(id) ON DELETE CASCADE not valid;

alter table "public"."support_confirmation" validate constraint "support_confirmation_amendment_id_fkey";

alter table "public"."support_confirmation" add constraint "support_confirmation_confirmed_by_id_fkey" FOREIGN KEY (confirmed_by_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."support_confirmation" validate constraint "support_confirmation_confirmed_by_id_fkey";

alter table "public"."thread" add constraint "thread_blog_id_fkey" FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE not valid;

alter table "public"."thread" validate constraint "thread_blog_id_fkey";

alter table "public"."thread" add constraint "thread_document_id_fkey" FOREIGN KEY (document_id) REFERENCES public.document(id) ON DELETE CASCADE not valid;

alter table "public"."thread" validate constraint "thread_document_id_fkey";

alter table "public"."thread" add constraint "thread_statement_id_fkey" FOREIGN KEY (statement_id) REFERENCES public.statement(id) ON DELETE CASCADE not valid;

alter table "public"."thread" validate constraint "thread_statement_id_fkey";

alter table "public"."thread" add constraint "thread_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."thread" validate constraint "thread_user_id_fkey";

alter table "public"."thread_vote" add constraint "thread_vote_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.thread(id) ON DELETE CASCADE not valid;

alter table "public"."thread_vote" validate constraint "thread_vote_thread_id_fkey";

alter table "public"."thread_vote" add constraint "thread_vote_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."thread_vote" validate constraint "thread_vote_user_id_fkey";

alter table "public"."todo" add constraint "todo_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."todo" validate constraint "todo_creator_id_fkey";

alter table "public"."todo_assignment" add constraint "todo_assignment_todo_id_fkey" FOREIGN KEY (todo_id) REFERENCES public.todo(id) ON DELETE CASCADE not valid;

alter table "public"."todo_assignment" validate constraint "todo_assignment_todo_id_fkey";

alter table "public"."todo_assignment" add constraint "todo_assignment_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."todo_assignment" validate constraint "todo_assignment_user_id_fkey";

alter table "public"."user_hashtag" add constraint "user_hashtag_hashtag_id_fkey" FOREIGN KEY (hashtag_id) REFERENCES public.hashtag(id) ON DELETE CASCADE not valid;

alter table "public"."user_hashtag" validate constraint "user_hashtag_hashtag_id_fkey";

alter table "public"."user_hashtag" add constraint "user_hashtag_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."user_hashtag" validate constraint "user_hashtag_user_id_fkey";

alter table "public"."user_hashtag" add constraint "user_hashtag_user_id_hashtag_id_key" UNIQUE using index "user_hashtag_user_id_hashtag_id_key";

alter table "public"."user_preference" add constraint "user_preference_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."user_preference" validate constraint "user_preference_user_id_fkey";

alter table "public"."user_preference" add constraint "user_preference_user_id_key" UNIQUE using index "user_preference_user_id_key";

alter table "public"."vote_choice" add constraint "vote_choice_vote_id_fkey" FOREIGN KEY (vote_id) REFERENCES public.vote(id) ON DELETE CASCADE not valid;

alter table "public"."vote_choice" validate constraint "vote_choice_vote_id_fkey";

alter table "public"."voter" add constraint "voter_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."voter" validate constraint "voter_user_id_fkey";

alter table "public"."voter" add constraint "voter_vote_id_fkey" FOREIGN KEY (vote_id) REFERENCES public.vote(id) ON DELETE CASCADE not valid;

alter table "public"."voter" validate constraint "voter_vote_id_fkey";

alter table "public"."voter" add constraint "voter_vote_id_user_id_key" UNIQUE using index "voter_vote_id_user_id_key";

alter table "public"."voting_password" add constraint "voting_password_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE not valid;

alter table "public"."voting_password" validate constraint "voting_password_user_id_fkey";

alter table "public"."voting_password" add constraint "voting_password_user_id_key" UNIQUE using index "voting_password_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public."user" (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.notification_setting (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$
;

grant delete on table "public"."accreditation" to "anon";

grant insert on table "public"."accreditation" to "anon";

grant references on table "public"."accreditation" to "anon";

grant select on table "public"."accreditation" to "anon";

grant trigger on table "public"."accreditation" to "anon";

grant truncate on table "public"."accreditation" to "anon";

grant update on table "public"."accreditation" to "anon";

grant delete on table "public"."accreditation" to "authenticated";

grant insert on table "public"."accreditation" to "authenticated";

grant references on table "public"."accreditation" to "authenticated";

grant select on table "public"."accreditation" to "authenticated";

grant trigger on table "public"."accreditation" to "authenticated";

grant truncate on table "public"."accreditation" to "authenticated";

grant update on table "public"."accreditation" to "authenticated";

grant delete on table "public"."accreditation" to "service_role";

grant insert on table "public"."accreditation" to "service_role";

grant references on table "public"."accreditation" to "service_role";

grant select on table "public"."accreditation" to "service_role";

grant trigger on table "public"."accreditation" to "service_role";

grant truncate on table "public"."accreditation" to "service_role";

grant update on table "public"."accreditation" to "service_role";

grant delete on table "public"."action_right" to "anon";

grant insert on table "public"."action_right" to "anon";

grant references on table "public"."action_right" to "anon";

grant select on table "public"."action_right" to "anon";

grant trigger on table "public"."action_right" to "anon";

grant truncate on table "public"."action_right" to "anon";

grant update on table "public"."action_right" to "anon";

grant delete on table "public"."action_right" to "authenticated";

grant insert on table "public"."action_right" to "authenticated";

grant references on table "public"."action_right" to "authenticated";

grant select on table "public"."action_right" to "authenticated";

grant trigger on table "public"."action_right" to "authenticated";

grant truncate on table "public"."action_right" to "authenticated";

grant update on table "public"."action_right" to "authenticated";

grant delete on table "public"."action_right" to "service_role";

grant insert on table "public"."action_right" to "service_role";

grant references on table "public"."action_right" to "service_role";

grant select on table "public"."action_right" to "service_role";

grant trigger on table "public"."action_right" to "service_role";

grant truncate on table "public"."action_right" to "service_role";

grant update on table "public"."action_right" to "service_role";

grant delete on table "public"."agenda_item" to "anon";

grant insert on table "public"."agenda_item" to "anon";

grant references on table "public"."agenda_item" to "anon";

grant select on table "public"."agenda_item" to "anon";

grant trigger on table "public"."agenda_item" to "anon";

grant truncate on table "public"."agenda_item" to "anon";

grant update on table "public"."agenda_item" to "anon";

grant delete on table "public"."agenda_item" to "authenticated";

grant insert on table "public"."agenda_item" to "authenticated";

grant references on table "public"."agenda_item" to "authenticated";

grant select on table "public"."agenda_item" to "authenticated";

grant trigger on table "public"."agenda_item" to "authenticated";

grant truncate on table "public"."agenda_item" to "authenticated";

grant update on table "public"."agenda_item" to "authenticated";

grant delete on table "public"."agenda_item" to "service_role";

grant insert on table "public"."agenda_item" to "service_role";

grant references on table "public"."agenda_item" to "service_role";

grant select on table "public"."agenda_item" to "service_role";

grant trigger on table "public"."agenda_item" to "service_role";

grant truncate on table "public"."agenda_item" to "service_role";

grant update on table "public"."agenda_item" to "service_role";

grant delete on table "public"."amendment" to "anon";

grant insert on table "public"."amendment" to "anon";

grant references on table "public"."amendment" to "anon";

grant select on table "public"."amendment" to "anon";

grant trigger on table "public"."amendment" to "anon";

grant truncate on table "public"."amendment" to "anon";

grant update on table "public"."amendment" to "anon";

grant delete on table "public"."amendment" to "authenticated";

grant insert on table "public"."amendment" to "authenticated";

grant references on table "public"."amendment" to "authenticated";

grant select on table "public"."amendment" to "authenticated";

grant trigger on table "public"."amendment" to "authenticated";

grant truncate on table "public"."amendment" to "authenticated";

grant update on table "public"."amendment" to "authenticated";

grant delete on table "public"."amendment" to "service_role";

grant insert on table "public"."amendment" to "service_role";

grant references on table "public"."amendment" to "service_role";

grant select on table "public"."amendment" to "service_role";

grant trigger on table "public"."amendment" to "service_role";

grant truncate on table "public"."amendment" to "service_role";

grant update on table "public"."amendment" to "service_role";

grant delete on table "public"."amendment_collaborator" to "anon";

grant insert on table "public"."amendment_collaborator" to "anon";

grant references on table "public"."amendment_collaborator" to "anon";

grant select on table "public"."amendment_collaborator" to "anon";

grant trigger on table "public"."amendment_collaborator" to "anon";

grant truncate on table "public"."amendment_collaborator" to "anon";

grant update on table "public"."amendment_collaborator" to "anon";

grant delete on table "public"."amendment_collaborator" to "authenticated";

grant insert on table "public"."amendment_collaborator" to "authenticated";

grant references on table "public"."amendment_collaborator" to "authenticated";

grant select on table "public"."amendment_collaborator" to "authenticated";

grant trigger on table "public"."amendment_collaborator" to "authenticated";

grant truncate on table "public"."amendment_collaborator" to "authenticated";

grant update on table "public"."amendment_collaborator" to "authenticated";

grant delete on table "public"."amendment_collaborator" to "service_role";

grant insert on table "public"."amendment_collaborator" to "service_role";

grant references on table "public"."amendment_collaborator" to "service_role";

grant select on table "public"."amendment_collaborator" to "service_role";

grant trigger on table "public"."amendment_collaborator" to "service_role";

grant truncate on table "public"."amendment_collaborator" to "service_role";

grant update on table "public"."amendment_collaborator" to "service_role";

grant delete on table "public"."amendment_hashtag" to "anon";

grant insert on table "public"."amendment_hashtag" to "anon";

grant references on table "public"."amendment_hashtag" to "anon";

grant select on table "public"."amendment_hashtag" to "anon";

grant trigger on table "public"."amendment_hashtag" to "anon";

grant truncate on table "public"."amendment_hashtag" to "anon";

grant update on table "public"."amendment_hashtag" to "anon";

grant delete on table "public"."amendment_hashtag" to "authenticated";

grant insert on table "public"."amendment_hashtag" to "authenticated";

grant references on table "public"."amendment_hashtag" to "authenticated";

grant select on table "public"."amendment_hashtag" to "authenticated";

grant trigger on table "public"."amendment_hashtag" to "authenticated";

grant truncate on table "public"."amendment_hashtag" to "authenticated";

grant update on table "public"."amendment_hashtag" to "authenticated";

grant delete on table "public"."amendment_hashtag" to "service_role";

grant insert on table "public"."amendment_hashtag" to "service_role";

grant references on table "public"."amendment_hashtag" to "service_role";

grant select on table "public"."amendment_hashtag" to "service_role";

grant trigger on table "public"."amendment_hashtag" to "service_role";

grant truncate on table "public"."amendment_hashtag" to "service_role";

grant update on table "public"."amendment_hashtag" to "service_role";

grant delete on table "public"."amendment_path" to "anon";

grant insert on table "public"."amendment_path" to "anon";

grant references on table "public"."amendment_path" to "anon";

grant select on table "public"."amendment_path" to "anon";

grant trigger on table "public"."amendment_path" to "anon";

grant truncate on table "public"."amendment_path" to "anon";

grant update on table "public"."amendment_path" to "anon";

grant delete on table "public"."amendment_path" to "authenticated";

grant insert on table "public"."amendment_path" to "authenticated";

grant references on table "public"."amendment_path" to "authenticated";

grant select on table "public"."amendment_path" to "authenticated";

grant trigger on table "public"."amendment_path" to "authenticated";

grant truncate on table "public"."amendment_path" to "authenticated";

grant update on table "public"."amendment_path" to "authenticated";

grant delete on table "public"."amendment_path" to "service_role";

grant insert on table "public"."amendment_path" to "service_role";

grant references on table "public"."amendment_path" to "service_role";

grant select on table "public"."amendment_path" to "service_role";

grant trigger on table "public"."amendment_path" to "service_role";

grant truncate on table "public"."amendment_path" to "service_role";

grant update on table "public"."amendment_path" to "service_role";

grant delete on table "public"."amendment_path_segment" to "anon";

grant insert on table "public"."amendment_path_segment" to "anon";

grant references on table "public"."amendment_path_segment" to "anon";

grant select on table "public"."amendment_path_segment" to "anon";

grant trigger on table "public"."amendment_path_segment" to "anon";

grant truncate on table "public"."amendment_path_segment" to "anon";

grant update on table "public"."amendment_path_segment" to "anon";

grant delete on table "public"."amendment_path_segment" to "authenticated";

grant insert on table "public"."amendment_path_segment" to "authenticated";

grant references on table "public"."amendment_path_segment" to "authenticated";

grant select on table "public"."amendment_path_segment" to "authenticated";

grant trigger on table "public"."amendment_path_segment" to "authenticated";

grant truncate on table "public"."amendment_path_segment" to "authenticated";

grant update on table "public"."amendment_path_segment" to "authenticated";

grant delete on table "public"."amendment_path_segment" to "service_role";

grant insert on table "public"."amendment_path_segment" to "service_role";

grant references on table "public"."amendment_path_segment" to "service_role";

grant select on table "public"."amendment_path_segment" to "service_role";

grant trigger on table "public"."amendment_path_segment" to "service_role";

grant truncate on table "public"."amendment_path_segment" to "service_role";

grant update on table "public"."amendment_path_segment" to "service_role";

grant delete on table "public"."amendment_support_vote" to "anon";

grant insert on table "public"."amendment_support_vote" to "anon";

grant references on table "public"."amendment_support_vote" to "anon";

grant select on table "public"."amendment_support_vote" to "anon";

grant trigger on table "public"."amendment_support_vote" to "anon";

grant truncate on table "public"."amendment_support_vote" to "anon";

grant update on table "public"."amendment_support_vote" to "anon";

grant delete on table "public"."amendment_support_vote" to "authenticated";

grant insert on table "public"."amendment_support_vote" to "authenticated";

grant references on table "public"."amendment_support_vote" to "authenticated";

grant select on table "public"."amendment_support_vote" to "authenticated";

grant trigger on table "public"."amendment_support_vote" to "authenticated";

grant truncate on table "public"."amendment_support_vote" to "authenticated";

grant update on table "public"."amendment_support_vote" to "authenticated";

grant delete on table "public"."amendment_support_vote" to "service_role";

grant insert on table "public"."amendment_support_vote" to "service_role";

grant references on table "public"."amendment_support_vote" to "service_role";

grant select on table "public"."amendment_support_vote" to "service_role";

grant trigger on table "public"."amendment_support_vote" to "service_role";

grant truncate on table "public"."amendment_support_vote" to "service_role";

grant update on table "public"."amendment_support_vote" to "service_role";

grant delete on table "public"."amendment_vote_entry" to "anon";

grant insert on table "public"."amendment_vote_entry" to "anon";

grant references on table "public"."amendment_vote_entry" to "anon";

grant select on table "public"."amendment_vote_entry" to "anon";

grant trigger on table "public"."amendment_vote_entry" to "anon";

grant truncate on table "public"."amendment_vote_entry" to "anon";

grant update on table "public"."amendment_vote_entry" to "anon";

grant delete on table "public"."amendment_vote_entry" to "authenticated";

grant insert on table "public"."amendment_vote_entry" to "authenticated";

grant references on table "public"."amendment_vote_entry" to "authenticated";

grant select on table "public"."amendment_vote_entry" to "authenticated";

grant trigger on table "public"."amendment_vote_entry" to "authenticated";

grant truncate on table "public"."amendment_vote_entry" to "authenticated";

grant update on table "public"."amendment_vote_entry" to "authenticated";

grant delete on table "public"."amendment_vote_entry" to "service_role";

grant insert on table "public"."amendment_vote_entry" to "service_role";

grant references on table "public"."amendment_vote_entry" to "service_role";

grant select on table "public"."amendment_vote_entry" to "service_role";

grant trigger on table "public"."amendment_vote_entry" to "service_role";

grant truncate on table "public"."amendment_vote_entry" to "service_role";

grant update on table "public"."amendment_vote_entry" to "service_role";

grant delete on table "public"."blog" to "anon";

grant insert on table "public"."blog" to "anon";

grant references on table "public"."blog" to "anon";

grant select on table "public"."blog" to "anon";

grant trigger on table "public"."blog" to "anon";

grant truncate on table "public"."blog" to "anon";

grant update on table "public"."blog" to "anon";

grant delete on table "public"."blog" to "authenticated";

grant insert on table "public"."blog" to "authenticated";

grant references on table "public"."blog" to "authenticated";

grant select on table "public"."blog" to "authenticated";

grant trigger on table "public"."blog" to "authenticated";

grant truncate on table "public"."blog" to "authenticated";

grant update on table "public"."blog" to "authenticated";

grant delete on table "public"."blog" to "service_role";

grant insert on table "public"."blog" to "service_role";

grant references on table "public"."blog" to "service_role";

grant select on table "public"."blog" to "service_role";

grant trigger on table "public"."blog" to "service_role";

grant truncate on table "public"."blog" to "service_role";

grant update on table "public"."blog" to "service_role";

grant delete on table "public"."blog_blogger" to "anon";

grant insert on table "public"."blog_blogger" to "anon";

grant references on table "public"."blog_blogger" to "anon";

grant select on table "public"."blog_blogger" to "anon";

grant trigger on table "public"."blog_blogger" to "anon";

grant truncate on table "public"."blog_blogger" to "anon";

grant update on table "public"."blog_blogger" to "anon";

grant delete on table "public"."blog_blogger" to "authenticated";

grant insert on table "public"."blog_blogger" to "authenticated";

grant references on table "public"."blog_blogger" to "authenticated";

grant select on table "public"."blog_blogger" to "authenticated";

grant trigger on table "public"."blog_blogger" to "authenticated";

grant truncate on table "public"."blog_blogger" to "authenticated";

grant update on table "public"."blog_blogger" to "authenticated";

grant delete on table "public"."blog_blogger" to "service_role";

grant insert on table "public"."blog_blogger" to "service_role";

grant references on table "public"."blog_blogger" to "service_role";

grant select on table "public"."blog_blogger" to "service_role";

grant trigger on table "public"."blog_blogger" to "service_role";

grant truncate on table "public"."blog_blogger" to "service_role";

grant update on table "public"."blog_blogger" to "service_role";

grant delete on table "public"."blog_hashtag" to "anon";

grant insert on table "public"."blog_hashtag" to "anon";

grant references on table "public"."blog_hashtag" to "anon";

grant select on table "public"."blog_hashtag" to "anon";

grant trigger on table "public"."blog_hashtag" to "anon";

grant truncate on table "public"."blog_hashtag" to "anon";

grant update on table "public"."blog_hashtag" to "anon";

grant delete on table "public"."blog_hashtag" to "authenticated";

grant insert on table "public"."blog_hashtag" to "authenticated";

grant references on table "public"."blog_hashtag" to "authenticated";

grant select on table "public"."blog_hashtag" to "authenticated";

grant trigger on table "public"."blog_hashtag" to "authenticated";

grant truncate on table "public"."blog_hashtag" to "authenticated";

grant update on table "public"."blog_hashtag" to "authenticated";

grant delete on table "public"."blog_hashtag" to "service_role";

grant insert on table "public"."blog_hashtag" to "service_role";

grant references on table "public"."blog_hashtag" to "service_role";

grant select on table "public"."blog_hashtag" to "service_role";

grant trigger on table "public"."blog_hashtag" to "service_role";

grant truncate on table "public"."blog_hashtag" to "service_role";

grant update on table "public"."blog_hashtag" to "service_role";

grant delete on table "public"."blog_support_vote" to "anon";

grant insert on table "public"."blog_support_vote" to "anon";

grant references on table "public"."blog_support_vote" to "anon";

grant select on table "public"."blog_support_vote" to "anon";

grant trigger on table "public"."blog_support_vote" to "anon";

grant truncate on table "public"."blog_support_vote" to "anon";

grant update on table "public"."blog_support_vote" to "anon";

grant delete on table "public"."blog_support_vote" to "authenticated";

grant insert on table "public"."blog_support_vote" to "authenticated";

grant references on table "public"."blog_support_vote" to "authenticated";

grant select on table "public"."blog_support_vote" to "authenticated";

grant trigger on table "public"."blog_support_vote" to "authenticated";

grant truncate on table "public"."blog_support_vote" to "authenticated";

grant update on table "public"."blog_support_vote" to "authenticated";

grant delete on table "public"."blog_support_vote" to "service_role";

grant insert on table "public"."blog_support_vote" to "service_role";

grant references on table "public"."blog_support_vote" to "service_role";

grant select on table "public"."blog_support_vote" to "service_role";

grant trigger on table "public"."blog_support_vote" to "service_role";

grant truncate on table "public"."blog_support_vote" to "service_role";

grant update on table "public"."blog_support_vote" to "service_role";

grant delete on table "public"."calendar_subscription" to "anon";

grant insert on table "public"."calendar_subscription" to "anon";

grant references on table "public"."calendar_subscription" to "anon";

grant select on table "public"."calendar_subscription" to "anon";

grant trigger on table "public"."calendar_subscription" to "anon";

grant truncate on table "public"."calendar_subscription" to "anon";

grant update on table "public"."calendar_subscription" to "anon";

grant delete on table "public"."calendar_subscription" to "authenticated";

grant insert on table "public"."calendar_subscription" to "authenticated";

grant references on table "public"."calendar_subscription" to "authenticated";

grant select on table "public"."calendar_subscription" to "authenticated";

grant trigger on table "public"."calendar_subscription" to "authenticated";

grant truncate on table "public"."calendar_subscription" to "authenticated";

grant update on table "public"."calendar_subscription" to "authenticated";

grant delete on table "public"."calendar_subscription" to "service_role";

grant insert on table "public"."calendar_subscription" to "service_role";

grant references on table "public"."calendar_subscription" to "service_role";

grant select on table "public"."calendar_subscription" to "service_role";

grant trigger on table "public"."calendar_subscription" to "service_role";

grant truncate on table "public"."calendar_subscription" to "service_role";

grant update on table "public"."calendar_subscription" to "service_role";

grant delete on table "public"."change_request" to "anon";

grant insert on table "public"."change_request" to "anon";

grant references on table "public"."change_request" to "anon";

grant select on table "public"."change_request" to "anon";

grant trigger on table "public"."change_request" to "anon";

grant truncate on table "public"."change_request" to "anon";

grant update on table "public"."change_request" to "anon";

grant delete on table "public"."change_request" to "authenticated";

grant insert on table "public"."change_request" to "authenticated";

grant references on table "public"."change_request" to "authenticated";

grant select on table "public"."change_request" to "authenticated";

grant trigger on table "public"."change_request" to "authenticated";

grant truncate on table "public"."change_request" to "authenticated";

grant update on table "public"."change_request" to "authenticated";

grant delete on table "public"."change_request" to "service_role";

grant insert on table "public"."change_request" to "service_role";

grant references on table "public"."change_request" to "service_role";

grant select on table "public"."change_request" to "service_role";

grant trigger on table "public"."change_request" to "service_role";

grant truncate on table "public"."change_request" to "service_role";

grant update on table "public"."change_request" to "service_role";

grant delete on table "public"."change_request_vote" to "anon";

grant insert on table "public"."change_request_vote" to "anon";

grant references on table "public"."change_request_vote" to "anon";

grant select on table "public"."change_request_vote" to "anon";

grant trigger on table "public"."change_request_vote" to "anon";

grant truncate on table "public"."change_request_vote" to "anon";

grant update on table "public"."change_request_vote" to "anon";

grant delete on table "public"."change_request_vote" to "authenticated";

grant insert on table "public"."change_request_vote" to "authenticated";

grant references on table "public"."change_request_vote" to "authenticated";

grant select on table "public"."change_request_vote" to "authenticated";

grant trigger on table "public"."change_request_vote" to "authenticated";

grant truncate on table "public"."change_request_vote" to "authenticated";

grant update on table "public"."change_request_vote" to "authenticated";

grant delete on table "public"."change_request_vote" to "service_role";

grant insert on table "public"."change_request_vote" to "service_role";

grant references on table "public"."change_request_vote" to "service_role";

grant select on table "public"."change_request_vote" to "service_role";

grant trigger on table "public"."change_request_vote" to "service_role";

grant truncate on table "public"."change_request_vote" to "service_role";

grant update on table "public"."change_request_vote" to "service_role";

grant delete on table "public"."comment" to "anon";

grant insert on table "public"."comment" to "anon";

grant references on table "public"."comment" to "anon";

grant select on table "public"."comment" to "anon";

grant trigger on table "public"."comment" to "anon";

grant truncate on table "public"."comment" to "anon";

grant update on table "public"."comment" to "anon";

grant delete on table "public"."comment" to "authenticated";

grant insert on table "public"."comment" to "authenticated";

grant references on table "public"."comment" to "authenticated";

grant select on table "public"."comment" to "authenticated";

grant trigger on table "public"."comment" to "authenticated";

grant truncate on table "public"."comment" to "authenticated";

grant update on table "public"."comment" to "authenticated";

grant delete on table "public"."comment" to "service_role";

grant insert on table "public"."comment" to "service_role";

grant references on table "public"."comment" to "service_role";

grant select on table "public"."comment" to "service_role";

grant trigger on table "public"."comment" to "service_role";

grant truncate on table "public"."comment" to "service_role";

grant update on table "public"."comment" to "service_role";

grant delete on table "public"."comment_vote" to "anon";

grant insert on table "public"."comment_vote" to "anon";

grant references on table "public"."comment_vote" to "anon";

grant select on table "public"."comment_vote" to "anon";

grant trigger on table "public"."comment_vote" to "anon";

grant truncate on table "public"."comment_vote" to "anon";

grant update on table "public"."comment_vote" to "anon";

grant delete on table "public"."comment_vote" to "authenticated";

grant insert on table "public"."comment_vote" to "authenticated";

grant references on table "public"."comment_vote" to "authenticated";

grant select on table "public"."comment_vote" to "authenticated";

grant trigger on table "public"."comment_vote" to "authenticated";

grant truncate on table "public"."comment_vote" to "authenticated";

grant update on table "public"."comment_vote" to "authenticated";

grant delete on table "public"."comment_vote" to "service_role";

grant insert on table "public"."comment_vote" to "service_role";

grant references on table "public"."comment_vote" to "service_role";

grant select on table "public"."comment_vote" to "service_role";

grant trigger on table "public"."comment_vote" to "service_role";

grant truncate on table "public"."comment_vote" to "service_role";

grant update on table "public"."comment_vote" to "service_role";

grant delete on table "public"."conversation" to "anon";

grant insert on table "public"."conversation" to "anon";

grant references on table "public"."conversation" to "anon";

grant select on table "public"."conversation" to "anon";

grant trigger on table "public"."conversation" to "anon";

grant truncate on table "public"."conversation" to "anon";

grant update on table "public"."conversation" to "anon";

grant delete on table "public"."conversation" to "authenticated";

grant insert on table "public"."conversation" to "authenticated";

grant references on table "public"."conversation" to "authenticated";

grant select on table "public"."conversation" to "authenticated";

grant trigger on table "public"."conversation" to "authenticated";

grant truncate on table "public"."conversation" to "authenticated";

grant update on table "public"."conversation" to "authenticated";

grant delete on table "public"."conversation" to "service_role";

grant insert on table "public"."conversation" to "service_role";

grant references on table "public"."conversation" to "service_role";

grant select on table "public"."conversation" to "service_role";

grant trigger on table "public"."conversation" to "service_role";

grant truncate on table "public"."conversation" to "service_role";

grant update on table "public"."conversation" to "service_role";

grant delete on table "public"."conversation_participant" to "anon";

grant insert on table "public"."conversation_participant" to "anon";

grant references on table "public"."conversation_participant" to "anon";

grant select on table "public"."conversation_participant" to "anon";

grant trigger on table "public"."conversation_participant" to "anon";

grant truncate on table "public"."conversation_participant" to "anon";

grant update on table "public"."conversation_participant" to "anon";

grant delete on table "public"."conversation_participant" to "authenticated";

grant insert on table "public"."conversation_participant" to "authenticated";

grant references on table "public"."conversation_participant" to "authenticated";

grant select on table "public"."conversation_participant" to "authenticated";

grant trigger on table "public"."conversation_participant" to "authenticated";

grant truncate on table "public"."conversation_participant" to "authenticated";

grant update on table "public"."conversation_participant" to "authenticated";

grant delete on table "public"."conversation_participant" to "service_role";

grant insert on table "public"."conversation_participant" to "service_role";

grant references on table "public"."conversation_participant" to "service_role";

grant select on table "public"."conversation_participant" to "service_role";

grant trigger on table "public"."conversation_participant" to "service_role";

grant truncate on table "public"."conversation_participant" to "service_role";

grant update on table "public"."conversation_participant" to "service_role";

grant delete on table "public"."document" to "anon";

grant insert on table "public"."document" to "anon";

grant references on table "public"."document" to "anon";

grant select on table "public"."document" to "anon";

grant trigger on table "public"."document" to "anon";

grant truncate on table "public"."document" to "anon";

grant update on table "public"."document" to "anon";

grant delete on table "public"."document" to "authenticated";

grant insert on table "public"."document" to "authenticated";

grant references on table "public"."document" to "authenticated";

grant select on table "public"."document" to "authenticated";

grant trigger on table "public"."document" to "authenticated";

grant truncate on table "public"."document" to "authenticated";

grant update on table "public"."document" to "authenticated";

grant delete on table "public"."document" to "service_role";

grant insert on table "public"."document" to "service_role";

grant references on table "public"."document" to "service_role";

grant select on table "public"."document" to "service_role";

grant trigger on table "public"."document" to "service_role";

grant truncate on table "public"."document" to "service_role";

grant update on table "public"."document" to "service_role";

grant delete on table "public"."document_collaborator" to "anon";

grant insert on table "public"."document_collaborator" to "anon";

grant references on table "public"."document_collaborator" to "anon";

grant select on table "public"."document_collaborator" to "anon";

grant trigger on table "public"."document_collaborator" to "anon";

grant truncate on table "public"."document_collaborator" to "anon";

grant update on table "public"."document_collaborator" to "anon";

grant delete on table "public"."document_collaborator" to "authenticated";

grant insert on table "public"."document_collaborator" to "authenticated";

grant references on table "public"."document_collaborator" to "authenticated";

grant select on table "public"."document_collaborator" to "authenticated";

grant trigger on table "public"."document_collaborator" to "authenticated";

grant truncate on table "public"."document_collaborator" to "authenticated";

grant update on table "public"."document_collaborator" to "authenticated";

grant delete on table "public"."document_collaborator" to "service_role";

grant insert on table "public"."document_collaborator" to "service_role";

grant references on table "public"."document_collaborator" to "service_role";

grant select on table "public"."document_collaborator" to "service_role";

grant trigger on table "public"."document_collaborator" to "service_role";

grant truncate on table "public"."document_collaborator" to "service_role";

grant update on table "public"."document_collaborator" to "service_role";

grant delete on table "public"."document_cursor" to "anon";

grant insert on table "public"."document_cursor" to "anon";

grant references on table "public"."document_cursor" to "anon";

grant select on table "public"."document_cursor" to "anon";

grant trigger on table "public"."document_cursor" to "anon";

grant truncate on table "public"."document_cursor" to "anon";

grant update on table "public"."document_cursor" to "anon";

grant delete on table "public"."document_cursor" to "authenticated";

grant insert on table "public"."document_cursor" to "authenticated";

grant references on table "public"."document_cursor" to "authenticated";

grant select on table "public"."document_cursor" to "authenticated";

grant trigger on table "public"."document_cursor" to "authenticated";

grant truncate on table "public"."document_cursor" to "authenticated";

grant update on table "public"."document_cursor" to "authenticated";

grant delete on table "public"."document_cursor" to "service_role";

grant insert on table "public"."document_cursor" to "service_role";

grant references on table "public"."document_cursor" to "service_role";

grant select on table "public"."document_cursor" to "service_role";

grant trigger on table "public"."document_cursor" to "service_role";

grant truncate on table "public"."document_cursor" to "service_role";

grant update on table "public"."document_cursor" to "service_role";

grant delete on table "public"."document_version" to "anon";

grant insert on table "public"."document_version" to "anon";

grant references on table "public"."document_version" to "anon";

grant select on table "public"."document_version" to "anon";

grant trigger on table "public"."document_version" to "anon";

grant truncate on table "public"."document_version" to "anon";

grant update on table "public"."document_version" to "anon";

grant delete on table "public"."document_version" to "authenticated";

grant insert on table "public"."document_version" to "authenticated";

grant references on table "public"."document_version" to "authenticated";

grant select on table "public"."document_version" to "authenticated";

grant trigger on table "public"."document_version" to "authenticated";

grant truncate on table "public"."document_version" to "authenticated";

grant update on table "public"."document_version" to "authenticated";

grant delete on table "public"."document_version" to "service_role";

grant insert on table "public"."document_version" to "service_role";

grant references on table "public"."document_version" to "service_role";

grant select on table "public"."document_version" to "service_role";

grant trigger on table "public"."document_version" to "service_role";

grant truncate on table "public"."document_version" to "service_role";

grant update on table "public"."document_version" to "service_role";

grant delete on table "public"."election" to "anon";

grant insert on table "public"."election" to "anon";

grant references on table "public"."election" to "anon";

grant select on table "public"."election" to "anon";

grant trigger on table "public"."election" to "anon";

grant truncate on table "public"."election" to "anon";

grant update on table "public"."election" to "anon";

grant delete on table "public"."election" to "authenticated";

grant insert on table "public"."election" to "authenticated";

grant references on table "public"."election" to "authenticated";

grant select on table "public"."election" to "authenticated";

grant trigger on table "public"."election" to "authenticated";

grant truncate on table "public"."election" to "authenticated";

grant update on table "public"."election" to "authenticated";

grant delete on table "public"."election" to "service_role";

grant insert on table "public"."election" to "service_role";

grant references on table "public"."election" to "service_role";

grant select on table "public"."election" to "service_role";

grant trigger on table "public"."election" to "service_role";

grant truncate on table "public"."election" to "service_role";

grant update on table "public"."election" to "service_role";

grant delete on table "public"."election_candidate" to "anon";

grant insert on table "public"."election_candidate" to "anon";

grant references on table "public"."election_candidate" to "anon";

grant select on table "public"."election_candidate" to "anon";

grant trigger on table "public"."election_candidate" to "anon";

grant truncate on table "public"."election_candidate" to "anon";

grant update on table "public"."election_candidate" to "anon";

grant delete on table "public"."election_candidate" to "authenticated";

grant insert on table "public"."election_candidate" to "authenticated";

grant references on table "public"."election_candidate" to "authenticated";

grant select on table "public"."election_candidate" to "authenticated";

grant trigger on table "public"."election_candidate" to "authenticated";

grant truncate on table "public"."election_candidate" to "authenticated";

grant update on table "public"."election_candidate" to "authenticated";

grant delete on table "public"."election_candidate" to "service_role";

grant insert on table "public"."election_candidate" to "service_role";

grant references on table "public"."election_candidate" to "service_role";

grant select on table "public"."election_candidate" to "service_role";

grant trigger on table "public"."election_candidate" to "service_role";

grant truncate on table "public"."election_candidate" to "service_role";

grant update on table "public"."election_candidate" to "service_role";

grant delete on table "public"."elector" to "anon";

grant insert on table "public"."elector" to "anon";

grant references on table "public"."elector" to "anon";

grant select on table "public"."elector" to "anon";

grant trigger on table "public"."elector" to "anon";

grant truncate on table "public"."elector" to "anon";

grant update on table "public"."elector" to "anon";

grant delete on table "public"."elector" to "authenticated";

grant insert on table "public"."elector" to "authenticated";

grant references on table "public"."elector" to "authenticated";

grant select on table "public"."elector" to "authenticated";

grant trigger on table "public"."elector" to "authenticated";

grant truncate on table "public"."elector" to "authenticated";

grant update on table "public"."elector" to "authenticated";

grant delete on table "public"."elector" to "service_role";

grant insert on table "public"."elector" to "service_role";

grant references on table "public"."elector" to "service_role";

grant select on table "public"."elector" to "service_role";

grant trigger on table "public"."elector" to "service_role";

grant truncate on table "public"."elector" to "service_role";

grant update on table "public"."elector" to "service_role";

grant delete on table "public"."event" to "anon";

grant insert on table "public"."event" to "anon";

grant references on table "public"."event" to "anon";

grant select on table "public"."event" to "anon";

grant trigger on table "public"."event" to "anon";

grant truncate on table "public"."event" to "anon";

grant update on table "public"."event" to "anon";

grant delete on table "public"."event" to "authenticated";

grant insert on table "public"."event" to "authenticated";

grant references on table "public"."event" to "authenticated";

grant select on table "public"."event" to "authenticated";

grant trigger on table "public"."event" to "authenticated";

grant truncate on table "public"."event" to "authenticated";

grant update on table "public"."event" to "authenticated";

grant delete on table "public"."event" to "service_role";

grant insert on table "public"."event" to "service_role";

grant references on table "public"."event" to "service_role";

grant select on table "public"."event" to "service_role";

grant trigger on table "public"."event" to "service_role";

grant truncate on table "public"."event" to "service_role";

grant update on table "public"."event" to "service_role";

grant delete on table "public"."event_delegate" to "anon";

grant insert on table "public"."event_delegate" to "anon";

grant references on table "public"."event_delegate" to "anon";

grant select on table "public"."event_delegate" to "anon";

grant trigger on table "public"."event_delegate" to "anon";

grant truncate on table "public"."event_delegate" to "anon";

grant update on table "public"."event_delegate" to "anon";

grant delete on table "public"."event_delegate" to "authenticated";

grant insert on table "public"."event_delegate" to "authenticated";

grant references on table "public"."event_delegate" to "authenticated";

grant select on table "public"."event_delegate" to "authenticated";

grant trigger on table "public"."event_delegate" to "authenticated";

grant truncate on table "public"."event_delegate" to "authenticated";

grant update on table "public"."event_delegate" to "authenticated";

grant delete on table "public"."event_delegate" to "service_role";

grant insert on table "public"."event_delegate" to "service_role";

grant references on table "public"."event_delegate" to "service_role";

grant select on table "public"."event_delegate" to "service_role";

grant trigger on table "public"."event_delegate" to "service_role";

grant truncate on table "public"."event_delegate" to "service_role";

grant update on table "public"."event_delegate" to "service_role";

grant delete on table "public"."event_exception" to "anon";

grant insert on table "public"."event_exception" to "anon";

grant references on table "public"."event_exception" to "anon";

grant select on table "public"."event_exception" to "anon";

grant trigger on table "public"."event_exception" to "anon";

grant truncate on table "public"."event_exception" to "anon";

grant update on table "public"."event_exception" to "anon";

grant delete on table "public"."event_exception" to "authenticated";

grant insert on table "public"."event_exception" to "authenticated";

grant references on table "public"."event_exception" to "authenticated";

grant select on table "public"."event_exception" to "authenticated";

grant trigger on table "public"."event_exception" to "authenticated";

grant truncate on table "public"."event_exception" to "authenticated";

grant update on table "public"."event_exception" to "authenticated";

grant delete on table "public"."event_exception" to "service_role";

grant insert on table "public"."event_exception" to "service_role";

grant references on table "public"."event_exception" to "service_role";

grant select on table "public"."event_exception" to "service_role";

grant trigger on table "public"."event_exception" to "service_role";

grant truncate on table "public"."event_exception" to "service_role";

grant update on table "public"."event_exception" to "service_role";

grant delete on table "public"."event_hashtag" to "anon";

grant insert on table "public"."event_hashtag" to "anon";

grant references on table "public"."event_hashtag" to "anon";

grant select on table "public"."event_hashtag" to "anon";

grant trigger on table "public"."event_hashtag" to "anon";

grant truncate on table "public"."event_hashtag" to "anon";

grant update on table "public"."event_hashtag" to "anon";

grant delete on table "public"."event_hashtag" to "authenticated";

grant insert on table "public"."event_hashtag" to "authenticated";

grant references on table "public"."event_hashtag" to "authenticated";

grant select on table "public"."event_hashtag" to "authenticated";

grant trigger on table "public"."event_hashtag" to "authenticated";

grant truncate on table "public"."event_hashtag" to "authenticated";

grant update on table "public"."event_hashtag" to "authenticated";

grant delete on table "public"."event_hashtag" to "service_role";

grant insert on table "public"."event_hashtag" to "service_role";

grant references on table "public"."event_hashtag" to "service_role";

grant select on table "public"."event_hashtag" to "service_role";

grant trigger on table "public"."event_hashtag" to "service_role";

grant truncate on table "public"."event_hashtag" to "service_role";

grant update on table "public"."event_hashtag" to "service_role";

grant delete on table "public"."event_participant" to "anon";

grant insert on table "public"."event_participant" to "anon";

grant references on table "public"."event_participant" to "anon";

grant select on table "public"."event_participant" to "anon";

grant trigger on table "public"."event_participant" to "anon";

grant truncate on table "public"."event_participant" to "anon";

grant update on table "public"."event_participant" to "anon";

grant delete on table "public"."event_participant" to "authenticated";

grant insert on table "public"."event_participant" to "authenticated";

grant references on table "public"."event_participant" to "authenticated";

grant select on table "public"."event_participant" to "authenticated";

grant trigger on table "public"."event_participant" to "authenticated";

grant truncate on table "public"."event_participant" to "authenticated";

grant update on table "public"."event_participant" to "authenticated";

grant delete on table "public"."event_participant" to "service_role";

grant insert on table "public"."event_participant" to "service_role";

grant references on table "public"."event_participant" to "service_role";

grant select on table "public"."event_participant" to "service_role";

grant trigger on table "public"."event_participant" to "service_role";

grant truncate on table "public"."event_participant" to "service_role";

grant update on table "public"."event_participant" to "service_role";

grant delete on table "public"."event_position" to "anon";

grant insert on table "public"."event_position" to "anon";

grant references on table "public"."event_position" to "anon";

grant select on table "public"."event_position" to "anon";

grant trigger on table "public"."event_position" to "anon";

grant truncate on table "public"."event_position" to "anon";

grant update on table "public"."event_position" to "anon";

grant delete on table "public"."event_position" to "authenticated";

grant insert on table "public"."event_position" to "authenticated";

grant references on table "public"."event_position" to "authenticated";

grant select on table "public"."event_position" to "authenticated";

grant trigger on table "public"."event_position" to "authenticated";

grant truncate on table "public"."event_position" to "authenticated";

grant update on table "public"."event_position" to "authenticated";

grant delete on table "public"."event_position" to "service_role";

grant insert on table "public"."event_position" to "service_role";

grant references on table "public"."event_position" to "service_role";

grant select on table "public"."event_position" to "service_role";

grant trigger on table "public"."event_position" to "service_role";

grant truncate on table "public"."event_position" to "service_role";

grant update on table "public"."event_position" to "service_role";

grant delete on table "public"."event_position_holder" to "anon";

grant insert on table "public"."event_position_holder" to "anon";

grant references on table "public"."event_position_holder" to "anon";

grant select on table "public"."event_position_holder" to "anon";

grant trigger on table "public"."event_position_holder" to "anon";

grant truncate on table "public"."event_position_holder" to "anon";

grant update on table "public"."event_position_holder" to "anon";

grant delete on table "public"."event_position_holder" to "authenticated";

grant insert on table "public"."event_position_holder" to "authenticated";

grant references on table "public"."event_position_holder" to "authenticated";

grant select on table "public"."event_position_holder" to "authenticated";

grant trigger on table "public"."event_position_holder" to "authenticated";

grant truncate on table "public"."event_position_holder" to "authenticated";

grant update on table "public"."event_position_holder" to "authenticated";

grant delete on table "public"."event_position_holder" to "service_role";

grant insert on table "public"."event_position_holder" to "service_role";

grant references on table "public"."event_position_holder" to "service_role";

grant select on table "public"."event_position_holder" to "service_role";

grant trigger on table "public"."event_position_holder" to "service_role";

grant truncate on table "public"."event_position_holder" to "service_role";

grant update on table "public"."event_position_holder" to "service_role";

grant delete on table "public"."file" to "anon";

grant insert on table "public"."file" to "anon";

grant references on table "public"."file" to "anon";

grant select on table "public"."file" to "anon";

grant trigger on table "public"."file" to "anon";

grant truncate on table "public"."file" to "anon";

grant update on table "public"."file" to "anon";

grant delete on table "public"."file" to "authenticated";

grant insert on table "public"."file" to "authenticated";

grant references on table "public"."file" to "authenticated";

grant select on table "public"."file" to "authenticated";

grant trigger on table "public"."file" to "authenticated";

grant truncate on table "public"."file" to "authenticated";

grant update on table "public"."file" to "authenticated";

grant delete on table "public"."file" to "service_role";

grant insert on table "public"."file" to "service_role";

grant references on table "public"."file" to "service_role";

grant select on table "public"."file" to "service_role";

grant trigger on table "public"."file" to "service_role";

grant truncate on table "public"."file" to "service_role";

grant update on table "public"."file" to "service_role";

grant delete on table "public"."final_candidate_selection" to "anon";

grant insert on table "public"."final_candidate_selection" to "anon";

grant references on table "public"."final_candidate_selection" to "anon";

grant select on table "public"."final_candidate_selection" to "anon";

grant trigger on table "public"."final_candidate_selection" to "anon";

grant truncate on table "public"."final_candidate_selection" to "anon";

grant update on table "public"."final_candidate_selection" to "anon";

grant delete on table "public"."final_candidate_selection" to "authenticated";

grant insert on table "public"."final_candidate_selection" to "authenticated";

grant references on table "public"."final_candidate_selection" to "authenticated";

grant select on table "public"."final_candidate_selection" to "authenticated";

grant trigger on table "public"."final_candidate_selection" to "authenticated";

grant truncate on table "public"."final_candidate_selection" to "authenticated";

grant update on table "public"."final_candidate_selection" to "authenticated";

grant delete on table "public"."final_candidate_selection" to "service_role";

grant insert on table "public"."final_candidate_selection" to "service_role";

grant references on table "public"."final_candidate_selection" to "service_role";

grant select on table "public"."final_candidate_selection" to "service_role";

grant trigger on table "public"."final_candidate_selection" to "service_role";

grant truncate on table "public"."final_candidate_selection" to "service_role";

grant update on table "public"."final_candidate_selection" to "service_role";

grant delete on table "public"."final_choice_decision" to "anon";

grant insert on table "public"."final_choice_decision" to "anon";

grant references on table "public"."final_choice_decision" to "anon";

grant select on table "public"."final_choice_decision" to "anon";

grant trigger on table "public"."final_choice_decision" to "anon";

grant truncate on table "public"."final_choice_decision" to "anon";

grant update on table "public"."final_choice_decision" to "anon";

grant delete on table "public"."final_choice_decision" to "authenticated";

grant insert on table "public"."final_choice_decision" to "authenticated";

grant references on table "public"."final_choice_decision" to "authenticated";

grant select on table "public"."final_choice_decision" to "authenticated";

grant trigger on table "public"."final_choice_decision" to "authenticated";

grant truncate on table "public"."final_choice_decision" to "authenticated";

grant update on table "public"."final_choice_decision" to "authenticated";

grant delete on table "public"."final_choice_decision" to "service_role";

grant insert on table "public"."final_choice_decision" to "service_role";

grant references on table "public"."final_choice_decision" to "service_role";

grant select on table "public"."final_choice_decision" to "service_role";

grant trigger on table "public"."final_choice_decision" to "service_role";

grant truncate on table "public"."final_choice_decision" to "service_role";

grant update on table "public"."final_choice_decision" to "service_role";

grant delete on table "public"."final_elector_participation" to "anon";

grant insert on table "public"."final_elector_participation" to "anon";

grant references on table "public"."final_elector_participation" to "anon";

grant select on table "public"."final_elector_participation" to "anon";

grant trigger on table "public"."final_elector_participation" to "anon";

grant truncate on table "public"."final_elector_participation" to "anon";

grant update on table "public"."final_elector_participation" to "anon";

grant delete on table "public"."final_elector_participation" to "authenticated";

grant insert on table "public"."final_elector_participation" to "authenticated";

grant references on table "public"."final_elector_participation" to "authenticated";

grant select on table "public"."final_elector_participation" to "authenticated";

grant trigger on table "public"."final_elector_participation" to "authenticated";

grant truncate on table "public"."final_elector_participation" to "authenticated";

grant update on table "public"."final_elector_participation" to "authenticated";

grant delete on table "public"."final_elector_participation" to "service_role";

grant insert on table "public"."final_elector_participation" to "service_role";

grant references on table "public"."final_elector_participation" to "service_role";

grant select on table "public"."final_elector_participation" to "service_role";

grant trigger on table "public"."final_elector_participation" to "service_role";

grant truncate on table "public"."final_elector_participation" to "service_role";

grant update on table "public"."final_elector_participation" to "service_role";

grant delete on table "public"."final_voter_participation" to "anon";

grant insert on table "public"."final_voter_participation" to "anon";

grant references on table "public"."final_voter_participation" to "anon";

grant select on table "public"."final_voter_participation" to "anon";

grant trigger on table "public"."final_voter_participation" to "anon";

grant truncate on table "public"."final_voter_participation" to "anon";

grant update on table "public"."final_voter_participation" to "anon";

grant delete on table "public"."final_voter_participation" to "authenticated";

grant insert on table "public"."final_voter_participation" to "authenticated";

grant references on table "public"."final_voter_participation" to "authenticated";

grant select on table "public"."final_voter_participation" to "authenticated";

grant trigger on table "public"."final_voter_participation" to "authenticated";

grant truncate on table "public"."final_voter_participation" to "authenticated";

grant update on table "public"."final_voter_participation" to "authenticated";

grant delete on table "public"."final_voter_participation" to "service_role";

grant insert on table "public"."final_voter_participation" to "service_role";

grant references on table "public"."final_voter_participation" to "service_role";

grant select on table "public"."final_voter_participation" to "service_role";

grant trigger on table "public"."final_voter_participation" to "service_role";

grant truncate on table "public"."final_voter_participation" to "service_role";

grant update on table "public"."final_voter_participation" to "service_role";

grant delete on table "public"."follow" to "anon";

grant insert on table "public"."follow" to "anon";

grant references on table "public"."follow" to "anon";

grant select on table "public"."follow" to "anon";

grant trigger on table "public"."follow" to "anon";

grant truncate on table "public"."follow" to "anon";

grant update on table "public"."follow" to "anon";

grant delete on table "public"."follow" to "authenticated";

grant insert on table "public"."follow" to "authenticated";

grant references on table "public"."follow" to "authenticated";

grant select on table "public"."follow" to "authenticated";

grant trigger on table "public"."follow" to "authenticated";

grant truncate on table "public"."follow" to "authenticated";

grant update on table "public"."follow" to "authenticated";

grant delete on table "public"."follow" to "service_role";

grant insert on table "public"."follow" to "service_role";

grant references on table "public"."follow" to "service_role";

grant select on table "public"."follow" to "service_role";

grant trigger on table "public"."follow" to "service_role";

grant truncate on table "public"."follow" to "service_role";

grant update on table "public"."follow" to "service_role";

grant delete on table "public"."group" to "anon";

grant insert on table "public"."group" to "anon";

grant references on table "public"."group" to "anon";

grant select on table "public"."group" to "anon";

grant trigger on table "public"."group" to "anon";

grant truncate on table "public"."group" to "anon";

grant update on table "public"."group" to "anon";

grant delete on table "public"."group" to "authenticated";

grant insert on table "public"."group" to "authenticated";

grant references on table "public"."group" to "authenticated";

grant select on table "public"."group" to "authenticated";

grant trigger on table "public"."group" to "authenticated";

grant truncate on table "public"."group" to "authenticated";

grant update on table "public"."group" to "authenticated";

grant delete on table "public"."group" to "service_role";

grant insert on table "public"."group" to "service_role";

grant references on table "public"."group" to "service_role";

grant select on table "public"."group" to "service_role";

grant trigger on table "public"."group" to "service_role";

grant truncate on table "public"."group" to "service_role";

grant update on table "public"."group" to "service_role";

grant delete on table "public"."group_delegate_allocation" to "anon";

grant insert on table "public"."group_delegate_allocation" to "anon";

grant references on table "public"."group_delegate_allocation" to "anon";

grant select on table "public"."group_delegate_allocation" to "anon";

grant trigger on table "public"."group_delegate_allocation" to "anon";

grant truncate on table "public"."group_delegate_allocation" to "anon";

grant update on table "public"."group_delegate_allocation" to "anon";

grant delete on table "public"."group_delegate_allocation" to "authenticated";

grant insert on table "public"."group_delegate_allocation" to "authenticated";

grant references on table "public"."group_delegate_allocation" to "authenticated";

grant select on table "public"."group_delegate_allocation" to "authenticated";

grant trigger on table "public"."group_delegate_allocation" to "authenticated";

grant truncate on table "public"."group_delegate_allocation" to "authenticated";

grant update on table "public"."group_delegate_allocation" to "authenticated";

grant delete on table "public"."group_delegate_allocation" to "service_role";

grant insert on table "public"."group_delegate_allocation" to "service_role";

grant references on table "public"."group_delegate_allocation" to "service_role";

grant select on table "public"."group_delegate_allocation" to "service_role";

grant trigger on table "public"."group_delegate_allocation" to "service_role";

grant truncate on table "public"."group_delegate_allocation" to "service_role";

grant update on table "public"."group_delegate_allocation" to "service_role";

grant delete on table "public"."group_hashtag" to "anon";

grant insert on table "public"."group_hashtag" to "anon";

grant references on table "public"."group_hashtag" to "anon";

grant select on table "public"."group_hashtag" to "anon";

grant trigger on table "public"."group_hashtag" to "anon";

grant truncate on table "public"."group_hashtag" to "anon";

grant update on table "public"."group_hashtag" to "anon";

grant delete on table "public"."group_hashtag" to "authenticated";

grant insert on table "public"."group_hashtag" to "authenticated";

grant references on table "public"."group_hashtag" to "authenticated";

grant select on table "public"."group_hashtag" to "authenticated";

grant trigger on table "public"."group_hashtag" to "authenticated";

grant truncate on table "public"."group_hashtag" to "authenticated";

grant update on table "public"."group_hashtag" to "authenticated";

grant delete on table "public"."group_hashtag" to "service_role";

grant insert on table "public"."group_hashtag" to "service_role";

grant references on table "public"."group_hashtag" to "service_role";

grant select on table "public"."group_hashtag" to "service_role";

grant trigger on table "public"."group_hashtag" to "service_role";

grant truncate on table "public"."group_hashtag" to "service_role";

grant update on table "public"."group_hashtag" to "service_role";

grant delete on table "public"."group_membership" to "anon";

grant insert on table "public"."group_membership" to "anon";

grant references on table "public"."group_membership" to "anon";

grant select on table "public"."group_membership" to "anon";

grant trigger on table "public"."group_membership" to "anon";

grant truncate on table "public"."group_membership" to "anon";

grant update on table "public"."group_membership" to "anon";

grant delete on table "public"."group_membership" to "authenticated";

grant insert on table "public"."group_membership" to "authenticated";

grant references on table "public"."group_membership" to "authenticated";

grant select on table "public"."group_membership" to "authenticated";

grant trigger on table "public"."group_membership" to "authenticated";

grant truncate on table "public"."group_membership" to "authenticated";

grant update on table "public"."group_membership" to "authenticated";

grant delete on table "public"."group_membership" to "service_role";

grant insert on table "public"."group_membership" to "service_role";

grant references on table "public"."group_membership" to "service_role";

grant select on table "public"."group_membership" to "service_role";

grant trigger on table "public"."group_membership" to "service_role";

grant truncate on table "public"."group_membership" to "service_role";

grant update on table "public"."group_membership" to "service_role";

grant delete on table "public"."group_relationship" to "anon";

grant insert on table "public"."group_relationship" to "anon";

grant references on table "public"."group_relationship" to "anon";

grant select on table "public"."group_relationship" to "anon";

grant trigger on table "public"."group_relationship" to "anon";

grant truncate on table "public"."group_relationship" to "anon";

grant update on table "public"."group_relationship" to "anon";

grant delete on table "public"."group_relationship" to "authenticated";

grant insert on table "public"."group_relationship" to "authenticated";

grant references on table "public"."group_relationship" to "authenticated";

grant select on table "public"."group_relationship" to "authenticated";

grant trigger on table "public"."group_relationship" to "authenticated";

grant truncate on table "public"."group_relationship" to "authenticated";

grant update on table "public"."group_relationship" to "authenticated";

grant delete on table "public"."group_relationship" to "service_role";

grant insert on table "public"."group_relationship" to "service_role";

grant references on table "public"."group_relationship" to "service_role";

grant select on table "public"."group_relationship" to "service_role";

grant trigger on table "public"."group_relationship" to "service_role";

grant truncate on table "public"."group_relationship" to "service_role";

grant update on table "public"."group_relationship" to "service_role";

grant delete on table "public"."hashtag" to "anon";

grant insert on table "public"."hashtag" to "anon";

grant references on table "public"."hashtag" to "anon";

grant select on table "public"."hashtag" to "anon";

grant trigger on table "public"."hashtag" to "anon";

grant truncate on table "public"."hashtag" to "anon";

grant update on table "public"."hashtag" to "anon";

grant delete on table "public"."hashtag" to "authenticated";

grant insert on table "public"."hashtag" to "authenticated";

grant references on table "public"."hashtag" to "authenticated";

grant select on table "public"."hashtag" to "authenticated";

grant trigger on table "public"."hashtag" to "authenticated";

grant truncate on table "public"."hashtag" to "authenticated";

grant update on table "public"."hashtag" to "authenticated";

grant delete on table "public"."hashtag" to "service_role";

grant insert on table "public"."hashtag" to "service_role";

grant references on table "public"."hashtag" to "service_role";

grant select on table "public"."hashtag" to "service_role";

grant trigger on table "public"."hashtag" to "service_role";

grant truncate on table "public"."hashtag" to "service_role";

grant update on table "public"."hashtag" to "service_role";

grant delete on table "public"."indicative_candidate_selection" to "anon";

grant insert on table "public"."indicative_candidate_selection" to "anon";

grant references on table "public"."indicative_candidate_selection" to "anon";

grant select on table "public"."indicative_candidate_selection" to "anon";

grant trigger on table "public"."indicative_candidate_selection" to "anon";

grant truncate on table "public"."indicative_candidate_selection" to "anon";

grant update on table "public"."indicative_candidate_selection" to "anon";

grant delete on table "public"."indicative_candidate_selection" to "authenticated";

grant insert on table "public"."indicative_candidate_selection" to "authenticated";

grant references on table "public"."indicative_candidate_selection" to "authenticated";

grant select on table "public"."indicative_candidate_selection" to "authenticated";

grant trigger on table "public"."indicative_candidate_selection" to "authenticated";

grant truncate on table "public"."indicative_candidate_selection" to "authenticated";

grant update on table "public"."indicative_candidate_selection" to "authenticated";

grant delete on table "public"."indicative_candidate_selection" to "service_role";

grant insert on table "public"."indicative_candidate_selection" to "service_role";

grant references on table "public"."indicative_candidate_selection" to "service_role";

grant select on table "public"."indicative_candidate_selection" to "service_role";

grant trigger on table "public"."indicative_candidate_selection" to "service_role";

grant truncate on table "public"."indicative_candidate_selection" to "service_role";

grant update on table "public"."indicative_candidate_selection" to "service_role";

grant delete on table "public"."indicative_choice_decision" to "anon";

grant insert on table "public"."indicative_choice_decision" to "anon";

grant references on table "public"."indicative_choice_decision" to "anon";

grant select on table "public"."indicative_choice_decision" to "anon";

grant trigger on table "public"."indicative_choice_decision" to "anon";

grant truncate on table "public"."indicative_choice_decision" to "anon";

grant update on table "public"."indicative_choice_decision" to "anon";

grant delete on table "public"."indicative_choice_decision" to "authenticated";

grant insert on table "public"."indicative_choice_decision" to "authenticated";

grant references on table "public"."indicative_choice_decision" to "authenticated";

grant select on table "public"."indicative_choice_decision" to "authenticated";

grant trigger on table "public"."indicative_choice_decision" to "authenticated";

grant truncate on table "public"."indicative_choice_decision" to "authenticated";

grant update on table "public"."indicative_choice_decision" to "authenticated";

grant delete on table "public"."indicative_choice_decision" to "service_role";

grant insert on table "public"."indicative_choice_decision" to "service_role";

grant references on table "public"."indicative_choice_decision" to "service_role";

grant select on table "public"."indicative_choice_decision" to "service_role";

grant trigger on table "public"."indicative_choice_decision" to "service_role";

grant truncate on table "public"."indicative_choice_decision" to "service_role";

grant update on table "public"."indicative_choice_decision" to "service_role";

grant delete on table "public"."indicative_elector_participation" to "anon";

grant insert on table "public"."indicative_elector_participation" to "anon";

grant references on table "public"."indicative_elector_participation" to "anon";

grant select on table "public"."indicative_elector_participation" to "anon";

grant trigger on table "public"."indicative_elector_participation" to "anon";

grant truncate on table "public"."indicative_elector_participation" to "anon";

grant update on table "public"."indicative_elector_participation" to "anon";

grant delete on table "public"."indicative_elector_participation" to "authenticated";

grant insert on table "public"."indicative_elector_participation" to "authenticated";

grant references on table "public"."indicative_elector_participation" to "authenticated";

grant select on table "public"."indicative_elector_participation" to "authenticated";

grant trigger on table "public"."indicative_elector_participation" to "authenticated";

grant truncate on table "public"."indicative_elector_participation" to "authenticated";

grant update on table "public"."indicative_elector_participation" to "authenticated";

grant delete on table "public"."indicative_elector_participation" to "service_role";

grant insert on table "public"."indicative_elector_participation" to "service_role";

grant references on table "public"."indicative_elector_participation" to "service_role";

grant select on table "public"."indicative_elector_participation" to "service_role";

grant trigger on table "public"."indicative_elector_participation" to "service_role";

grant truncate on table "public"."indicative_elector_participation" to "service_role";

grant update on table "public"."indicative_elector_participation" to "service_role";

grant delete on table "public"."indicative_voter_participation" to "anon";

grant insert on table "public"."indicative_voter_participation" to "anon";

grant references on table "public"."indicative_voter_participation" to "anon";

grant select on table "public"."indicative_voter_participation" to "anon";

grant trigger on table "public"."indicative_voter_participation" to "anon";

grant truncate on table "public"."indicative_voter_participation" to "anon";

grant update on table "public"."indicative_voter_participation" to "anon";

grant delete on table "public"."indicative_voter_participation" to "authenticated";

grant insert on table "public"."indicative_voter_participation" to "authenticated";

grant references on table "public"."indicative_voter_participation" to "authenticated";

grant select on table "public"."indicative_voter_participation" to "authenticated";

grant trigger on table "public"."indicative_voter_participation" to "authenticated";

grant truncate on table "public"."indicative_voter_participation" to "authenticated";

grant update on table "public"."indicative_voter_participation" to "authenticated";

grant delete on table "public"."indicative_voter_participation" to "service_role";

grant insert on table "public"."indicative_voter_participation" to "service_role";

grant references on table "public"."indicative_voter_participation" to "service_role";

grant select on table "public"."indicative_voter_participation" to "service_role";

grant trigger on table "public"."indicative_voter_participation" to "service_role";

grant truncate on table "public"."indicative_voter_participation" to "service_role";

grant update on table "public"."indicative_voter_participation" to "service_role";

grant delete on table "public"."link" to "anon";

grant insert on table "public"."link" to "anon";

grant references on table "public"."link" to "anon";

grant select on table "public"."link" to "anon";

grant trigger on table "public"."link" to "anon";

grant truncate on table "public"."link" to "anon";

grant update on table "public"."link" to "anon";

grant delete on table "public"."link" to "authenticated";

grant insert on table "public"."link" to "authenticated";

grant references on table "public"."link" to "authenticated";

grant select on table "public"."link" to "authenticated";

grant trigger on table "public"."link" to "authenticated";

grant truncate on table "public"."link" to "authenticated";

grant update on table "public"."link" to "authenticated";

grant delete on table "public"."link" to "service_role";

grant insert on table "public"."link" to "service_role";

grant references on table "public"."link" to "service_role";

grant select on table "public"."link" to "service_role";

grant trigger on table "public"."link" to "service_role";

grant truncate on table "public"."link" to "service_role";

grant update on table "public"."link" to "service_role";

grant delete on table "public"."meeting_booking" to "anon";

grant insert on table "public"."meeting_booking" to "anon";

grant references on table "public"."meeting_booking" to "anon";

grant select on table "public"."meeting_booking" to "anon";

grant trigger on table "public"."meeting_booking" to "anon";

grant truncate on table "public"."meeting_booking" to "anon";

grant update on table "public"."meeting_booking" to "anon";

grant delete on table "public"."meeting_booking" to "authenticated";

grant insert on table "public"."meeting_booking" to "authenticated";

grant references on table "public"."meeting_booking" to "authenticated";

grant select on table "public"."meeting_booking" to "authenticated";

grant trigger on table "public"."meeting_booking" to "authenticated";

grant truncate on table "public"."meeting_booking" to "authenticated";

grant update on table "public"."meeting_booking" to "authenticated";

grant delete on table "public"."meeting_booking" to "service_role";

grant insert on table "public"."meeting_booking" to "service_role";

grant references on table "public"."meeting_booking" to "service_role";

grant select on table "public"."meeting_booking" to "service_role";

grant trigger on table "public"."meeting_booking" to "service_role";

grant truncate on table "public"."meeting_booking" to "service_role";

grant update on table "public"."meeting_booking" to "service_role";

grant delete on table "public"."meeting_slot" to "anon";

grant insert on table "public"."meeting_slot" to "anon";

grant references on table "public"."meeting_slot" to "anon";

grant select on table "public"."meeting_slot" to "anon";

grant trigger on table "public"."meeting_slot" to "anon";

grant truncate on table "public"."meeting_slot" to "anon";

grant update on table "public"."meeting_slot" to "anon";

grant delete on table "public"."meeting_slot" to "authenticated";

grant insert on table "public"."meeting_slot" to "authenticated";

grant references on table "public"."meeting_slot" to "authenticated";

grant select on table "public"."meeting_slot" to "authenticated";

grant trigger on table "public"."meeting_slot" to "authenticated";

grant truncate on table "public"."meeting_slot" to "authenticated";

grant update on table "public"."meeting_slot" to "authenticated";

grant delete on table "public"."meeting_slot" to "service_role";

grant insert on table "public"."meeting_slot" to "service_role";

grant references on table "public"."meeting_slot" to "service_role";

grant select on table "public"."meeting_slot" to "service_role";

grant trigger on table "public"."meeting_slot" to "service_role";

grant truncate on table "public"."meeting_slot" to "service_role";

grant update on table "public"."meeting_slot" to "service_role";

grant delete on table "public"."message" to "anon";

grant insert on table "public"."message" to "anon";

grant references on table "public"."message" to "anon";

grant select on table "public"."message" to "anon";

grant trigger on table "public"."message" to "anon";

grant truncate on table "public"."message" to "anon";

grant update on table "public"."message" to "anon";

grant delete on table "public"."message" to "authenticated";

grant insert on table "public"."message" to "authenticated";

grant references on table "public"."message" to "authenticated";

grant select on table "public"."message" to "authenticated";

grant trigger on table "public"."message" to "authenticated";

grant truncate on table "public"."message" to "authenticated";

grant update on table "public"."message" to "authenticated";

grant delete on table "public"."message" to "service_role";

grant insert on table "public"."message" to "service_role";

grant references on table "public"."message" to "service_role";

grant select on table "public"."message" to "service_role";

grant trigger on table "public"."message" to "service_role";

grant truncate on table "public"."message" to "service_role";

grant update on table "public"."message" to "service_role";

grant delete on table "public"."notification" to "anon";

grant insert on table "public"."notification" to "anon";

grant references on table "public"."notification" to "anon";

grant select on table "public"."notification" to "anon";

grant trigger on table "public"."notification" to "anon";

grant truncate on table "public"."notification" to "anon";

grant update on table "public"."notification" to "anon";

grant delete on table "public"."notification" to "authenticated";

grant insert on table "public"."notification" to "authenticated";

grant references on table "public"."notification" to "authenticated";

grant select on table "public"."notification" to "authenticated";

grant trigger on table "public"."notification" to "authenticated";

grant truncate on table "public"."notification" to "authenticated";

grant update on table "public"."notification" to "authenticated";

grant delete on table "public"."notification" to "service_role";

grant insert on table "public"."notification" to "service_role";

grant references on table "public"."notification" to "service_role";

grant select on table "public"."notification" to "service_role";

grant trigger on table "public"."notification" to "service_role";

grant truncate on table "public"."notification" to "service_role";

grant update on table "public"."notification" to "service_role";

grant delete on table "public"."notification_read" to "anon";

grant insert on table "public"."notification_read" to "anon";

grant references on table "public"."notification_read" to "anon";

grant select on table "public"."notification_read" to "anon";

grant trigger on table "public"."notification_read" to "anon";

grant truncate on table "public"."notification_read" to "anon";

grant update on table "public"."notification_read" to "anon";

grant delete on table "public"."notification_read" to "authenticated";

grant insert on table "public"."notification_read" to "authenticated";

grant references on table "public"."notification_read" to "authenticated";

grant select on table "public"."notification_read" to "authenticated";

grant trigger on table "public"."notification_read" to "authenticated";

grant truncate on table "public"."notification_read" to "authenticated";

grant update on table "public"."notification_read" to "authenticated";

grant delete on table "public"."notification_read" to "service_role";

grant insert on table "public"."notification_read" to "service_role";

grant references on table "public"."notification_read" to "service_role";

grant select on table "public"."notification_read" to "service_role";

grant trigger on table "public"."notification_read" to "service_role";

grant truncate on table "public"."notification_read" to "service_role";

grant update on table "public"."notification_read" to "service_role";

grant delete on table "public"."notification_setting" to "anon";

grant insert on table "public"."notification_setting" to "anon";

grant references on table "public"."notification_setting" to "anon";

grant select on table "public"."notification_setting" to "anon";

grant trigger on table "public"."notification_setting" to "anon";

grant truncate on table "public"."notification_setting" to "anon";

grant update on table "public"."notification_setting" to "anon";

grant delete on table "public"."notification_setting" to "authenticated";

grant insert on table "public"."notification_setting" to "authenticated";

grant references on table "public"."notification_setting" to "authenticated";

grant select on table "public"."notification_setting" to "authenticated";

grant trigger on table "public"."notification_setting" to "authenticated";

grant truncate on table "public"."notification_setting" to "authenticated";

grant update on table "public"."notification_setting" to "authenticated";

grant delete on table "public"."notification_setting" to "service_role";

grant insert on table "public"."notification_setting" to "service_role";

grant references on table "public"."notification_setting" to "service_role";

grant select on table "public"."notification_setting" to "service_role";

grant trigger on table "public"."notification_setting" to "service_role";

grant truncate on table "public"."notification_setting" to "service_role";

grant update on table "public"."notification_setting" to "service_role";

grant delete on table "public"."participant" to "anon";

grant insert on table "public"."participant" to "anon";

grant references on table "public"."participant" to "anon";

grant select on table "public"."participant" to "anon";

grant trigger on table "public"."participant" to "anon";

grant truncate on table "public"."participant" to "anon";

grant update on table "public"."participant" to "anon";

grant delete on table "public"."participant" to "authenticated";

grant insert on table "public"."participant" to "authenticated";

grant references on table "public"."participant" to "authenticated";

grant select on table "public"."participant" to "authenticated";

grant trigger on table "public"."participant" to "authenticated";

grant truncate on table "public"."participant" to "authenticated";

grant update on table "public"."participant" to "authenticated";

grant delete on table "public"."participant" to "service_role";

grant insert on table "public"."participant" to "service_role";

grant references on table "public"."participant" to "service_role";

grant select on table "public"."participant" to "service_role";

grant trigger on table "public"."participant" to "service_role";

grant truncate on table "public"."participant" to "service_role";

grant update on table "public"."participant" to "service_role";

grant delete on table "public"."payment" to "anon";

grant insert on table "public"."payment" to "anon";

grant references on table "public"."payment" to "anon";

grant select on table "public"."payment" to "anon";

grant trigger on table "public"."payment" to "anon";

grant truncate on table "public"."payment" to "anon";

grant update on table "public"."payment" to "anon";

grant delete on table "public"."payment" to "authenticated";

grant insert on table "public"."payment" to "authenticated";

grant references on table "public"."payment" to "authenticated";

grant select on table "public"."payment" to "authenticated";

grant trigger on table "public"."payment" to "authenticated";

grant truncate on table "public"."payment" to "authenticated";

grant update on table "public"."payment" to "authenticated";

grant delete on table "public"."payment" to "service_role";

grant insert on table "public"."payment" to "service_role";

grant references on table "public"."payment" to "service_role";

grant select on table "public"."payment" to "service_role";

grant trigger on table "public"."payment" to "service_role";

grant truncate on table "public"."payment" to "service_role";

grant update on table "public"."payment" to "service_role";

grant delete on table "public"."position" to "anon";

grant insert on table "public"."position" to "anon";

grant references on table "public"."position" to "anon";

grant select on table "public"."position" to "anon";

grant trigger on table "public"."position" to "anon";

grant truncate on table "public"."position" to "anon";

grant update on table "public"."position" to "anon";

grant delete on table "public"."position" to "authenticated";

grant insert on table "public"."position" to "authenticated";

grant references on table "public"."position" to "authenticated";

grant select on table "public"."position" to "authenticated";

grant trigger on table "public"."position" to "authenticated";

grant truncate on table "public"."position" to "authenticated";

grant update on table "public"."position" to "authenticated";

grant delete on table "public"."position" to "service_role";

grant insert on table "public"."position" to "service_role";

grant references on table "public"."position" to "service_role";

grant select on table "public"."position" to "service_role";

grant trigger on table "public"."position" to "service_role";

grant truncate on table "public"."position" to "service_role";

grant update on table "public"."position" to "service_role";

grant delete on table "public"."position_holder_history" to "anon";

grant insert on table "public"."position_holder_history" to "anon";

grant references on table "public"."position_holder_history" to "anon";

grant select on table "public"."position_holder_history" to "anon";

grant trigger on table "public"."position_holder_history" to "anon";

grant truncate on table "public"."position_holder_history" to "anon";

grant update on table "public"."position_holder_history" to "anon";

grant delete on table "public"."position_holder_history" to "authenticated";

grant insert on table "public"."position_holder_history" to "authenticated";

grant references on table "public"."position_holder_history" to "authenticated";

grant select on table "public"."position_holder_history" to "authenticated";

grant trigger on table "public"."position_holder_history" to "authenticated";

grant truncate on table "public"."position_holder_history" to "authenticated";

grant update on table "public"."position_holder_history" to "authenticated";

grant delete on table "public"."position_holder_history" to "service_role";

grant insert on table "public"."position_holder_history" to "service_role";

grant references on table "public"."position_holder_history" to "service_role";

grant select on table "public"."position_holder_history" to "service_role";

grant trigger on table "public"."position_holder_history" to "service_role";

grant truncate on table "public"."position_holder_history" to "service_role";

grant update on table "public"."position_holder_history" to "service_role";

grant delete on table "public"."push_subscription" to "anon";

grant insert on table "public"."push_subscription" to "anon";

grant references on table "public"."push_subscription" to "anon";

grant select on table "public"."push_subscription" to "anon";

grant trigger on table "public"."push_subscription" to "anon";

grant truncate on table "public"."push_subscription" to "anon";

grant update on table "public"."push_subscription" to "anon";

grant delete on table "public"."push_subscription" to "authenticated";

grant insert on table "public"."push_subscription" to "authenticated";

grant references on table "public"."push_subscription" to "authenticated";

grant select on table "public"."push_subscription" to "authenticated";

grant trigger on table "public"."push_subscription" to "authenticated";

grant truncate on table "public"."push_subscription" to "authenticated";

grant update on table "public"."push_subscription" to "authenticated";

grant delete on table "public"."push_subscription" to "service_role";

grant insert on table "public"."push_subscription" to "service_role";

grant references on table "public"."push_subscription" to "service_role";

grant select on table "public"."push_subscription" to "service_role";

grant trigger on table "public"."push_subscription" to "service_role";

grant truncate on table "public"."push_subscription" to "service_role";

grant update on table "public"."push_subscription" to "service_role";

grant delete on table "public"."reaction" to "anon";

grant insert on table "public"."reaction" to "anon";

grant references on table "public"."reaction" to "anon";

grant select on table "public"."reaction" to "anon";

grant trigger on table "public"."reaction" to "anon";

grant truncate on table "public"."reaction" to "anon";

grant update on table "public"."reaction" to "anon";

grant delete on table "public"."reaction" to "authenticated";

grant insert on table "public"."reaction" to "authenticated";

grant references on table "public"."reaction" to "authenticated";

grant select on table "public"."reaction" to "authenticated";

grant trigger on table "public"."reaction" to "authenticated";

grant truncate on table "public"."reaction" to "authenticated";

grant update on table "public"."reaction" to "authenticated";

grant delete on table "public"."reaction" to "service_role";

grant insert on table "public"."reaction" to "service_role";

grant references on table "public"."reaction" to "service_role";

grant select on table "public"."reaction" to "service_role";

grant trigger on table "public"."reaction" to "service_role";

grant truncate on table "public"."reaction" to "service_role";

grant update on table "public"."reaction" to "service_role";

grant delete on table "public"."role" to "anon";

grant insert on table "public"."role" to "anon";

grant references on table "public"."role" to "anon";

grant select on table "public"."role" to "anon";

grant trigger on table "public"."role" to "anon";

grant truncate on table "public"."role" to "anon";

grant update on table "public"."role" to "anon";

grant delete on table "public"."role" to "authenticated";

grant insert on table "public"."role" to "authenticated";

grant references on table "public"."role" to "authenticated";

grant select on table "public"."role" to "authenticated";

grant trigger on table "public"."role" to "authenticated";

grant truncate on table "public"."role" to "authenticated";

grant update on table "public"."role" to "authenticated";

grant delete on table "public"."role" to "service_role";

grant insert on table "public"."role" to "service_role";

grant references on table "public"."role" to "service_role";

grant select on table "public"."role" to "service_role";

grant trigger on table "public"."role" to "service_role";

grant truncate on table "public"."role" to "service_role";

grant update on table "public"."role" to "service_role";

grant delete on table "public"."speaker_list" to "anon";

grant insert on table "public"."speaker_list" to "anon";

grant references on table "public"."speaker_list" to "anon";

grant select on table "public"."speaker_list" to "anon";

grant trigger on table "public"."speaker_list" to "anon";

grant truncate on table "public"."speaker_list" to "anon";

grant update on table "public"."speaker_list" to "anon";

grant delete on table "public"."speaker_list" to "authenticated";

grant insert on table "public"."speaker_list" to "authenticated";

grant references on table "public"."speaker_list" to "authenticated";

grant select on table "public"."speaker_list" to "authenticated";

grant trigger on table "public"."speaker_list" to "authenticated";

grant truncate on table "public"."speaker_list" to "authenticated";

grant update on table "public"."speaker_list" to "authenticated";

grant delete on table "public"."speaker_list" to "service_role";

grant insert on table "public"."speaker_list" to "service_role";

grant references on table "public"."speaker_list" to "service_role";

grant select on table "public"."speaker_list" to "service_role";

grant trigger on table "public"."speaker_list" to "service_role";

grant truncate on table "public"."speaker_list" to "service_role";

grant update on table "public"."speaker_list" to "service_role";

grant delete on table "public"."statement" to "anon";

grant insert on table "public"."statement" to "anon";

grant references on table "public"."statement" to "anon";

grant select on table "public"."statement" to "anon";

grant trigger on table "public"."statement" to "anon";

grant truncate on table "public"."statement" to "anon";

grant update on table "public"."statement" to "anon";

grant delete on table "public"."statement" to "authenticated";

grant insert on table "public"."statement" to "authenticated";

grant references on table "public"."statement" to "authenticated";

grant select on table "public"."statement" to "authenticated";

grant trigger on table "public"."statement" to "authenticated";

grant truncate on table "public"."statement" to "authenticated";

grant update on table "public"."statement" to "authenticated";

grant delete on table "public"."statement" to "service_role";

grant insert on table "public"."statement" to "service_role";

grant references on table "public"."statement" to "service_role";

grant select on table "public"."statement" to "service_role";

grant trigger on table "public"."statement" to "service_role";

grant truncate on table "public"."statement" to "service_role";

grant update on table "public"."statement" to "service_role";

grant delete on table "public"."statement_hashtag" to "anon";

grant insert on table "public"."statement_hashtag" to "anon";

grant references on table "public"."statement_hashtag" to "anon";

grant select on table "public"."statement_hashtag" to "anon";

grant trigger on table "public"."statement_hashtag" to "anon";

grant truncate on table "public"."statement_hashtag" to "anon";

grant update on table "public"."statement_hashtag" to "anon";

grant delete on table "public"."statement_hashtag" to "authenticated";

grant insert on table "public"."statement_hashtag" to "authenticated";

grant references on table "public"."statement_hashtag" to "authenticated";

grant select on table "public"."statement_hashtag" to "authenticated";

grant trigger on table "public"."statement_hashtag" to "authenticated";

grant truncate on table "public"."statement_hashtag" to "authenticated";

grant update on table "public"."statement_hashtag" to "authenticated";

grant delete on table "public"."statement_hashtag" to "service_role";

grant insert on table "public"."statement_hashtag" to "service_role";

grant references on table "public"."statement_hashtag" to "service_role";

grant select on table "public"."statement_hashtag" to "service_role";

grant trigger on table "public"."statement_hashtag" to "service_role";

grant truncate on table "public"."statement_hashtag" to "service_role";

grant update on table "public"."statement_hashtag" to "service_role";

grant delete on table "public"."statement_support_vote" to "anon";

grant insert on table "public"."statement_support_vote" to "anon";

grant references on table "public"."statement_support_vote" to "anon";

grant select on table "public"."statement_support_vote" to "anon";

grant trigger on table "public"."statement_support_vote" to "anon";

grant truncate on table "public"."statement_support_vote" to "anon";

grant update on table "public"."statement_support_vote" to "anon";

grant delete on table "public"."statement_support_vote" to "authenticated";

grant insert on table "public"."statement_support_vote" to "authenticated";

grant references on table "public"."statement_support_vote" to "authenticated";

grant select on table "public"."statement_support_vote" to "authenticated";

grant trigger on table "public"."statement_support_vote" to "authenticated";

grant truncate on table "public"."statement_support_vote" to "authenticated";

grant update on table "public"."statement_support_vote" to "authenticated";

grant delete on table "public"."statement_support_vote" to "service_role";

grant insert on table "public"."statement_support_vote" to "service_role";

grant references on table "public"."statement_support_vote" to "service_role";

grant select on table "public"."statement_support_vote" to "service_role";

grant trigger on table "public"."statement_support_vote" to "service_role";

grant truncate on table "public"."statement_support_vote" to "service_role";

grant update on table "public"."statement_support_vote" to "service_role";

grant delete on table "public"."statement_survey" to "anon";

grant insert on table "public"."statement_survey" to "anon";

grant references on table "public"."statement_survey" to "anon";

grant select on table "public"."statement_survey" to "anon";

grant trigger on table "public"."statement_survey" to "anon";

grant truncate on table "public"."statement_survey" to "anon";

grant update on table "public"."statement_survey" to "anon";

grant delete on table "public"."statement_survey" to "authenticated";

grant insert on table "public"."statement_survey" to "authenticated";

grant references on table "public"."statement_survey" to "authenticated";

grant select on table "public"."statement_survey" to "authenticated";

grant trigger on table "public"."statement_survey" to "authenticated";

grant truncate on table "public"."statement_survey" to "authenticated";

grant update on table "public"."statement_survey" to "authenticated";

grant delete on table "public"."statement_survey" to "service_role";

grant insert on table "public"."statement_survey" to "service_role";

grant references on table "public"."statement_survey" to "service_role";

grant select on table "public"."statement_survey" to "service_role";

grant trigger on table "public"."statement_survey" to "service_role";

grant truncate on table "public"."statement_survey" to "service_role";

grant update on table "public"."statement_survey" to "service_role";

grant delete on table "public"."statement_survey_option" to "anon";

grant insert on table "public"."statement_survey_option" to "anon";

grant references on table "public"."statement_survey_option" to "anon";

grant select on table "public"."statement_survey_option" to "anon";

grant trigger on table "public"."statement_survey_option" to "anon";

grant truncate on table "public"."statement_survey_option" to "anon";

grant update on table "public"."statement_survey_option" to "anon";

grant delete on table "public"."statement_survey_option" to "authenticated";

grant insert on table "public"."statement_survey_option" to "authenticated";

grant references on table "public"."statement_survey_option" to "authenticated";

grant select on table "public"."statement_survey_option" to "authenticated";

grant trigger on table "public"."statement_survey_option" to "authenticated";

grant truncate on table "public"."statement_survey_option" to "authenticated";

grant update on table "public"."statement_survey_option" to "authenticated";

grant delete on table "public"."statement_survey_option" to "service_role";

grant insert on table "public"."statement_survey_option" to "service_role";

grant references on table "public"."statement_survey_option" to "service_role";

grant select on table "public"."statement_survey_option" to "service_role";

grant trigger on table "public"."statement_survey_option" to "service_role";

grant truncate on table "public"."statement_survey_option" to "service_role";

grant update on table "public"."statement_survey_option" to "service_role";

grant delete on table "public"."statement_survey_vote" to "anon";

grant insert on table "public"."statement_survey_vote" to "anon";

grant references on table "public"."statement_survey_vote" to "anon";

grant select on table "public"."statement_survey_vote" to "anon";

grant trigger on table "public"."statement_survey_vote" to "anon";

grant truncate on table "public"."statement_survey_vote" to "anon";

grant update on table "public"."statement_survey_vote" to "anon";

grant delete on table "public"."statement_survey_vote" to "authenticated";

grant insert on table "public"."statement_survey_vote" to "authenticated";

grant references on table "public"."statement_survey_vote" to "authenticated";

grant select on table "public"."statement_survey_vote" to "authenticated";

grant trigger on table "public"."statement_survey_vote" to "authenticated";

grant truncate on table "public"."statement_survey_vote" to "authenticated";

grant update on table "public"."statement_survey_vote" to "authenticated";

grant delete on table "public"."statement_survey_vote" to "service_role";

grant insert on table "public"."statement_survey_vote" to "service_role";

grant references on table "public"."statement_survey_vote" to "service_role";

grant select on table "public"."statement_survey_vote" to "service_role";

grant trigger on table "public"."statement_survey_vote" to "service_role";

grant truncate on table "public"."statement_survey_vote" to "service_role";

grant update on table "public"."statement_survey_vote" to "service_role";

grant delete on table "public"."stripe_customer" to "anon";

grant insert on table "public"."stripe_customer" to "anon";

grant references on table "public"."stripe_customer" to "anon";

grant select on table "public"."stripe_customer" to "anon";

grant trigger on table "public"."stripe_customer" to "anon";

grant truncate on table "public"."stripe_customer" to "anon";

grant update on table "public"."stripe_customer" to "anon";

grant delete on table "public"."stripe_customer" to "authenticated";

grant insert on table "public"."stripe_customer" to "authenticated";

grant references on table "public"."stripe_customer" to "authenticated";

grant select on table "public"."stripe_customer" to "authenticated";

grant trigger on table "public"."stripe_customer" to "authenticated";

grant truncate on table "public"."stripe_customer" to "authenticated";

grant update on table "public"."stripe_customer" to "authenticated";

grant delete on table "public"."stripe_customer" to "service_role";

grant insert on table "public"."stripe_customer" to "service_role";

grant references on table "public"."stripe_customer" to "service_role";

grant select on table "public"."stripe_customer" to "service_role";

grant trigger on table "public"."stripe_customer" to "service_role";

grant truncate on table "public"."stripe_customer" to "service_role";

grant update on table "public"."stripe_customer" to "service_role";

grant delete on table "public"."stripe_payment" to "anon";

grant insert on table "public"."stripe_payment" to "anon";

grant references on table "public"."stripe_payment" to "anon";

grant select on table "public"."stripe_payment" to "anon";

grant trigger on table "public"."stripe_payment" to "anon";

grant truncate on table "public"."stripe_payment" to "anon";

grant update on table "public"."stripe_payment" to "anon";

grant delete on table "public"."stripe_payment" to "authenticated";

grant insert on table "public"."stripe_payment" to "authenticated";

grant references on table "public"."stripe_payment" to "authenticated";

grant select on table "public"."stripe_payment" to "authenticated";

grant trigger on table "public"."stripe_payment" to "authenticated";

grant truncate on table "public"."stripe_payment" to "authenticated";

grant update on table "public"."stripe_payment" to "authenticated";

grant delete on table "public"."stripe_payment" to "service_role";

grant insert on table "public"."stripe_payment" to "service_role";

grant references on table "public"."stripe_payment" to "service_role";

grant select on table "public"."stripe_payment" to "service_role";

grant trigger on table "public"."stripe_payment" to "service_role";

grant truncate on table "public"."stripe_payment" to "service_role";

grant update on table "public"."stripe_payment" to "service_role";

grant delete on table "public"."stripe_subscription" to "anon";

grant insert on table "public"."stripe_subscription" to "anon";

grant references on table "public"."stripe_subscription" to "anon";

grant select on table "public"."stripe_subscription" to "anon";

grant trigger on table "public"."stripe_subscription" to "anon";

grant truncate on table "public"."stripe_subscription" to "anon";

grant update on table "public"."stripe_subscription" to "anon";

grant delete on table "public"."stripe_subscription" to "authenticated";

grant insert on table "public"."stripe_subscription" to "authenticated";

grant references on table "public"."stripe_subscription" to "authenticated";

grant select on table "public"."stripe_subscription" to "authenticated";

grant trigger on table "public"."stripe_subscription" to "authenticated";

grant truncate on table "public"."stripe_subscription" to "authenticated";

grant update on table "public"."stripe_subscription" to "authenticated";

grant delete on table "public"."stripe_subscription" to "service_role";

grant insert on table "public"."stripe_subscription" to "service_role";

grant references on table "public"."stripe_subscription" to "service_role";

grant select on table "public"."stripe_subscription" to "service_role";

grant trigger on table "public"."stripe_subscription" to "service_role";

grant truncate on table "public"."stripe_subscription" to "service_role";

grant update on table "public"."stripe_subscription" to "service_role";

grant delete on table "public"."subscriber" to "anon";

grant insert on table "public"."subscriber" to "anon";

grant references on table "public"."subscriber" to "anon";

grant select on table "public"."subscriber" to "anon";

grant trigger on table "public"."subscriber" to "anon";

grant truncate on table "public"."subscriber" to "anon";

grant update on table "public"."subscriber" to "anon";

grant delete on table "public"."subscriber" to "authenticated";

grant insert on table "public"."subscriber" to "authenticated";

grant references on table "public"."subscriber" to "authenticated";

grant select on table "public"."subscriber" to "authenticated";

grant trigger on table "public"."subscriber" to "authenticated";

grant truncate on table "public"."subscriber" to "authenticated";

grant update on table "public"."subscriber" to "authenticated";

grant delete on table "public"."subscriber" to "service_role";

grant insert on table "public"."subscriber" to "service_role";

grant references on table "public"."subscriber" to "service_role";

grant select on table "public"."subscriber" to "service_role";

grant trigger on table "public"."subscriber" to "service_role";

grant truncate on table "public"."subscriber" to "service_role";

grant update on table "public"."subscriber" to "service_role";

grant delete on table "public"."support_confirmation" to "anon";

grant insert on table "public"."support_confirmation" to "anon";

grant references on table "public"."support_confirmation" to "anon";

grant select on table "public"."support_confirmation" to "anon";

grant trigger on table "public"."support_confirmation" to "anon";

grant truncate on table "public"."support_confirmation" to "anon";

grant update on table "public"."support_confirmation" to "anon";

grant delete on table "public"."support_confirmation" to "authenticated";

grant insert on table "public"."support_confirmation" to "authenticated";

grant references on table "public"."support_confirmation" to "authenticated";

grant select on table "public"."support_confirmation" to "authenticated";

grant trigger on table "public"."support_confirmation" to "authenticated";

grant truncate on table "public"."support_confirmation" to "authenticated";

grant update on table "public"."support_confirmation" to "authenticated";

grant delete on table "public"."support_confirmation" to "service_role";

grant insert on table "public"."support_confirmation" to "service_role";

grant references on table "public"."support_confirmation" to "service_role";

grant select on table "public"."support_confirmation" to "service_role";

grant trigger on table "public"."support_confirmation" to "service_role";

grant truncate on table "public"."support_confirmation" to "service_role";

grant update on table "public"."support_confirmation" to "service_role";

grant delete on table "public"."thread" to "anon";

grant insert on table "public"."thread" to "anon";

grant references on table "public"."thread" to "anon";

grant select on table "public"."thread" to "anon";

grant trigger on table "public"."thread" to "anon";

grant truncate on table "public"."thread" to "anon";

grant update on table "public"."thread" to "anon";

grant delete on table "public"."thread" to "authenticated";

grant insert on table "public"."thread" to "authenticated";

grant references on table "public"."thread" to "authenticated";

grant select on table "public"."thread" to "authenticated";

grant trigger on table "public"."thread" to "authenticated";

grant truncate on table "public"."thread" to "authenticated";

grant update on table "public"."thread" to "authenticated";

grant delete on table "public"."thread" to "service_role";

grant insert on table "public"."thread" to "service_role";

grant references on table "public"."thread" to "service_role";

grant select on table "public"."thread" to "service_role";

grant trigger on table "public"."thread" to "service_role";

grant truncate on table "public"."thread" to "service_role";

grant update on table "public"."thread" to "service_role";

grant delete on table "public"."thread_vote" to "anon";

grant insert on table "public"."thread_vote" to "anon";

grant references on table "public"."thread_vote" to "anon";

grant select on table "public"."thread_vote" to "anon";

grant trigger on table "public"."thread_vote" to "anon";

grant truncate on table "public"."thread_vote" to "anon";

grant update on table "public"."thread_vote" to "anon";

grant delete on table "public"."thread_vote" to "authenticated";

grant insert on table "public"."thread_vote" to "authenticated";

grant references on table "public"."thread_vote" to "authenticated";

grant select on table "public"."thread_vote" to "authenticated";

grant trigger on table "public"."thread_vote" to "authenticated";

grant truncate on table "public"."thread_vote" to "authenticated";

grant update on table "public"."thread_vote" to "authenticated";

grant delete on table "public"."thread_vote" to "service_role";

grant insert on table "public"."thread_vote" to "service_role";

grant references on table "public"."thread_vote" to "service_role";

grant select on table "public"."thread_vote" to "service_role";

grant trigger on table "public"."thread_vote" to "service_role";

grant truncate on table "public"."thread_vote" to "service_role";

grant update on table "public"."thread_vote" to "service_role";

grant delete on table "public"."timeline_event" to "anon";

grant insert on table "public"."timeline_event" to "anon";

grant references on table "public"."timeline_event" to "anon";

grant select on table "public"."timeline_event" to "anon";

grant trigger on table "public"."timeline_event" to "anon";

grant truncate on table "public"."timeline_event" to "anon";

grant update on table "public"."timeline_event" to "anon";

grant delete on table "public"."timeline_event" to "authenticated";

grant insert on table "public"."timeline_event" to "authenticated";

grant references on table "public"."timeline_event" to "authenticated";

grant select on table "public"."timeline_event" to "authenticated";

grant trigger on table "public"."timeline_event" to "authenticated";

grant truncate on table "public"."timeline_event" to "authenticated";

grant update on table "public"."timeline_event" to "authenticated";

grant delete on table "public"."timeline_event" to "service_role";

grant insert on table "public"."timeline_event" to "service_role";

grant references on table "public"."timeline_event" to "service_role";

grant select on table "public"."timeline_event" to "service_role";

grant trigger on table "public"."timeline_event" to "service_role";

grant truncate on table "public"."timeline_event" to "service_role";

grant update on table "public"."timeline_event" to "service_role";

grant delete on table "public"."todo" to "anon";

grant insert on table "public"."todo" to "anon";

grant references on table "public"."todo" to "anon";

grant select on table "public"."todo" to "anon";

grant trigger on table "public"."todo" to "anon";

grant truncate on table "public"."todo" to "anon";

grant update on table "public"."todo" to "anon";

grant delete on table "public"."todo" to "authenticated";

grant insert on table "public"."todo" to "authenticated";

grant references on table "public"."todo" to "authenticated";

grant select on table "public"."todo" to "authenticated";

grant trigger on table "public"."todo" to "authenticated";

grant truncate on table "public"."todo" to "authenticated";

grant update on table "public"."todo" to "authenticated";

grant delete on table "public"."todo" to "service_role";

grant insert on table "public"."todo" to "service_role";

grant references on table "public"."todo" to "service_role";

grant select on table "public"."todo" to "service_role";

grant trigger on table "public"."todo" to "service_role";

grant truncate on table "public"."todo" to "service_role";

grant update on table "public"."todo" to "service_role";

grant delete on table "public"."todo_assignment" to "anon";

grant insert on table "public"."todo_assignment" to "anon";

grant references on table "public"."todo_assignment" to "anon";

grant select on table "public"."todo_assignment" to "anon";

grant trigger on table "public"."todo_assignment" to "anon";

grant truncate on table "public"."todo_assignment" to "anon";

grant update on table "public"."todo_assignment" to "anon";

grant delete on table "public"."todo_assignment" to "authenticated";

grant insert on table "public"."todo_assignment" to "authenticated";

grant references on table "public"."todo_assignment" to "authenticated";

grant select on table "public"."todo_assignment" to "authenticated";

grant trigger on table "public"."todo_assignment" to "authenticated";

grant truncate on table "public"."todo_assignment" to "authenticated";

grant update on table "public"."todo_assignment" to "authenticated";

grant delete on table "public"."todo_assignment" to "service_role";

grant insert on table "public"."todo_assignment" to "service_role";

grant references on table "public"."todo_assignment" to "service_role";

grant select on table "public"."todo_assignment" to "service_role";

grant trigger on table "public"."todo_assignment" to "service_role";

grant truncate on table "public"."todo_assignment" to "service_role";

grant update on table "public"."todo_assignment" to "service_role";

grant delete on table "public"."user" to "anon";

grant insert on table "public"."user" to "anon";

grant references on table "public"."user" to "anon";

grant select on table "public"."user" to "anon";

grant trigger on table "public"."user" to "anon";

grant truncate on table "public"."user" to "anon";

grant update on table "public"."user" to "anon";

grant delete on table "public"."user" to "authenticated";

grant insert on table "public"."user" to "authenticated";

grant references on table "public"."user" to "authenticated";

grant select on table "public"."user" to "authenticated";

grant trigger on table "public"."user" to "authenticated";

grant truncate on table "public"."user" to "authenticated";

grant update on table "public"."user" to "authenticated";

grant delete on table "public"."user" to "service_role";

grant insert on table "public"."user" to "service_role";

grant references on table "public"."user" to "service_role";

grant select on table "public"."user" to "service_role";

grant trigger on table "public"."user" to "service_role";

grant truncate on table "public"."user" to "service_role";

grant update on table "public"."user" to "service_role";

grant delete on table "public"."user_hashtag" to "anon";

grant insert on table "public"."user_hashtag" to "anon";

grant references on table "public"."user_hashtag" to "anon";

grant select on table "public"."user_hashtag" to "anon";

grant trigger on table "public"."user_hashtag" to "anon";

grant truncate on table "public"."user_hashtag" to "anon";

grant update on table "public"."user_hashtag" to "anon";

grant delete on table "public"."user_hashtag" to "authenticated";

grant insert on table "public"."user_hashtag" to "authenticated";

grant references on table "public"."user_hashtag" to "authenticated";

grant select on table "public"."user_hashtag" to "authenticated";

grant trigger on table "public"."user_hashtag" to "authenticated";

grant truncate on table "public"."user_hashtag" to "authenticated";

grant update on table "public"."user_hashtag" to "authenticated";

grant delete on table "public"."user_hashtag" to "service_role";

grant insert on table "public"."user_hashtag" to "service_role";

grant references on table "public"."user_hashtag" to "service_role";

grant select on table "public"."user_hashtag" to "service_role";

grant trigger on table "public"."user_hashtag" to "service_role";

grant truncate on table "public"."user_hashtag" to "service_role";

grant update on table "public"."user_hashtag" to "service_role";

grant delete on table "public"."user_preference" to "anon";

grant insert on table "public"."user_preference" to "anon";

grant references on table "public"."user_preference" to "anon";

grant select on table "public"."user_preference" to "anon";

grant trigger on table "public"."user_preference" to "anon";

grant truncate on table "public"."user_preference" to "anon";

grant update on table "public"."user_preference" to "anon";

grant delete on table "public"."user_preference" to "authenticated";

grant insert on table "public"."user_preference" to "authenticated";

grant references on table "public"."user_preference" to "authenticated";

grant select on table "public"."user_preference" to "authenticated";

grant trigger on table "public"."user_preference" to "authenticated";

grant truncate on table "public"."user_preference" to "authenticated";

grant update on table "public"."user_preference" to "authenticated";

grant delete on table "public"."user_preference" to "service_role";

grant insert on table "public"."user_preference" to "service_role";

grant references on table "public"."user_preference" to "service_role";

grant select on table "public"."user_preference" to "service_role";

grant trigger on table "public"."user_preference" to "service_role";

grant truncate on table "public"."user_preference" to "service_role";

grant update on table "public"."user_preference" to "service_role";

grant delete on table "public"."vote" to "anon";

grant insert on table "public"."vote" to "anon";

grant references on table "public"."vote" to "anon";

grant select on table "public"."vote" to "anon";

grant trigger on table "public"."vote" to "anon";

grant truncate on table "public"."vote" to "anon";

grant update on table "public"."vote" to "anon";

grant delete on table "public"."vote" to "authenticated";

grant insert on table "public"."vote" to "authenticated";

grant references on table "public"."vote" to "authenticated";

grant select on table "public"."vote" to "authenticated";

grant trigger on table "public"."vote" to "authenticated";

grant truncate on table "public"."vote" to "authenticated";

grant update on table "public"."vote" to "authenticated";

grant delete on table "public"."vote" to "service_role";

grant insert on table "public"."vote" to "service_role";

grant references on table "public"."vote" to "service_role";

grant select on table "public"."vote" to "service_role";

grant trigger on table "public"."vote" to "service_role";

grant truncate on table "public"."vote" to "service_role";

grant update on table "public"."vote" to "service_role";

grant delete on table "public"."vote_choice" to "anon";

grant insert on table "public"."vote_choice" to "anon";

grant references on table "public"."vote_choice" to "anon";

grant select on table "public"."vote_choice" to "anon";

grant trigger on table "public"."vote_choice" to "anon";

grant truncate on table "public"."vote_choice" to "anon";

grant update on table "public"."vote_choice" to "anon";

grant delete on table "public"."vote_choice" to "authenticated";

grant insert on table "public"."vote_choice" to "authenticated";

grant references on table "public"."vote_choice" to "authenticated";

grant select on table "public"."vote_choice" to "authenticated";

grant trigger on table "public"."vote_choice" to "authenticated";

grant truncate on table "public"."vote_choice" to "authenticated";

grant update on table "public"."vote_choice" to "authenticated";

grant delete on table "public"."vote_choice" to "service_role";

grant insert on table "public"."vote_choice" to "service_role";

grant references on table "public"."vote_choice" to "service_role";

grant select on table "public"."vote_choice" to "service_role";

grant trigger on table "public"."vote_choice" to "service_role";

grant truncate on table "public"."vote_choice" to "service_role";

grant update on table "public"."vote_choice" to "service_role";

grant delete on table "public"."voter" to "anon";

grant insert on table "public"."voter" to "anon";

grant references on table "public"."voter" to "anon";

grant select on table "public"."voter" to "anon";

grant trigger on table "public"."voter" to "anon";

grant truncate on table "public"."voter" to "anon";

grant update on table "public"."voter" to "anon";

grant delete on table "public"."voter" to "authenticated";

grant insert on table "public"."voter" to "authenticated";

grant references on table "public"."voter" to "authenticated";

grant select on table "public"."voter" to "authenticated";

grant trigger on table "public"."voter" to "authenticated";

grant truncate on table "public"."voter" to "authenticated";

grant update on table "public"."voter" to "authenticated";

grant delete on table "public"."voter" to "service_role";

grant insert on table "public"."voter" to "service_role";

grant references on table "public"."voter" to "service_role";

grant select on table "public"."voter" to "service_role";

grant trigger on table "public"."voter" to "service_role";

grant truncate on table "public"."voter" to "service_role";

grant update on table "public"."voter" to "service_role";

grant delete on table "public"."voting_password" to "anon";

grant insert on table "public"."voting_password" to "anon";

grant references on table "public"."voting_password" to "anon";

grant select on table "public"."voting_password" to "anon";

grant trigger on table "public"."voting_password" to "anon";

grant truncate on table "public"."voting_password" to "anon";

grant update on table "public"."voting_password" to "anon";

grant delete on table "public"."voting_password" to "authenticated";

grant insert on table "public"."voting_password" to "authenticated";

grant references on table "public"."voting_password" to "authenticated";

grant select on table "public"."voting_password" to "authenticated";

grant trigger on table "public"."voting_password" to "authenticated";

grant truncate on table "public"."voting_password" to "authenticated";

grant update on table "public"."voting_password" to "authenticated";

grant delete on table "public"."voting_password" to "service_role";

grant insert on table "public"."voting_password" to "service_role";

grant references on table "public"."voting_password" to "service_role";

grant select on table "public"."voting_password" to "service_role";

grant trigger on table "public"."voting_password" to "service_role";

grant truncate on table "public"."voting_password" to "service_role";

grant update on table "public"."voting_password" to "service_role";


  create policy "service_role_all"
  on "public"."accreditation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."action_right"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."agenda_item"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment_collaborator"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment_path"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment_path_segment"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment_support_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."amendment_vote_entry"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."blog"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."blog_blogger"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."blog_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."blog_support_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."calendar_subscription"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."change_request"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."change_request_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."comment"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."comment_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."conversation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."conversation_participant"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."document"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."document_collaborator"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."document_cursor"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."document_version"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."election"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."election_candidate"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."elector"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_delegate"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_exception"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_participant"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_position"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."event_position_holder"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."file"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."final_candidate_selection"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."final_choice_decision"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."final_elector_participation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."final_voter_participation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."follow"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."group"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."group_delegate_allocation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."group_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."group_membership"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."group_relationship"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."indicative_candidate_selection"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."indicative_choice_decision"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."indicative_elector_participation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."indicative_voter_participation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."link"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."meeting_booking"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."meeting_slot"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."message"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."notification"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."notification_read"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."notification_setting"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."participant"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."payment"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."position"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."position_holder_history"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."push_subscription"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."reaction"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."role"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."speaker_list"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_support_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_survey"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_survey_option"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."statement_survey_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."stripe_customer"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."stripe_payment"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."stripe_subscription"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."subscriber"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."support_confirmation"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."thread"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."thread_vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."timeline_event"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."todo"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."todo_assignment"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."user"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."user_hashtag"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."user_preference"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."vote"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."vote_choice"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."voter"
  as permissive
  for all
  to service_role
using (true);



  create policy "service_role_all"
  on "public"."voting_password"
  as permissive
  for all
  to service_role
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "avatars_auth_delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "avatars_auth_insert"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "avatars_auth_update"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "avatars_public_read"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "service_role_all_storage"
  on "storage"."objects"
  as permissive
  for all
  to service_role
using (true);



  create policy "uploads_auth_delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'uploads'::text));



  create policy "uploads_auth_insert"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'uploads'::text));



  create policy "uploads_auth_update"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'uploads'::text));



  create policy "uploads_public_read"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'uploads'::text));



