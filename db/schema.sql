CREATE TABLE IF NOT EXISTS learners (id UUID PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS learner_state (learner_id UUID PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,current_lesson_id TEXT,completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,lesson_history JSONB NOT NULL DEFAULT '[]'::jsonb,mastery JSONB NOT NULL DEFAULT '[]'::jsonb,errors JSONB NOT NULL DEFAULT '[]'::jsonb,next_action JSONB,state_version INTEGER NOT NULL DEFAULT 1,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE learner_state ADD COLUMN IF NOT EXISTS lesson_history JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE learner_state ADD COLUMN IF NOT EXISTS mastery_graph JSONB NOT NULL DEFAULT '[]'::jsonb;
CREATE TABLE IF NOT EXISTS learner_chunk_states (
  learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  chunk_id TEXT NOT NULL,
  knowledge TEXT NOT NULL CHECK (knowledge IN ('RECEPTIVE','PRODUCTIVE')),
  encounters INTEGER NOT NULL DEFAULT 0 CHECK (encounters >= 0),
  productive_attempts INTEGER NOT NULL DEFAULT 0 CHECK (productive_attempts >= 0),
  successful_productions INTEGER NOT NULL DEFAULT 0 CHECK (successful_productions >= 0),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review_at TIMESTAMPTZ,
  PRIMARY KEY (learner_id, chunk_id)
);
CREATE INDEX IF NOT EXISTS learner_chunk_review_idx ON learner_chunk_states(learner_id, next_review_at);
CREATE TABLE IF NOT EXISTS learner_profiles (learner_id UUID PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,display_name TEXT NOT NULL DEFAULT 'Learner',native_language TEXT NOT NULL DEFAULT 'Arabic',target_level TEXT NOT NULL DEFAULT 'B1',daily_minutes INTEGER NOT NULL DEFAULT 20 CHECK (daily_minutes BETWEEN 5 AND 180),goals JSONB NOT NULL DEFAULT '[]'::jsonb,english_dna JSONB NOT NULL DEFAULT '{}'::jsonb,pathway_selection JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS pathway_selection JSONB;
CREATE TABLE IF NOT EXISTS diagnostic_attempts (id UUID PRIMARY KEY,learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,answers JSONB NOT NULL,scores JSONB NOT NULL,cefr_level TEXT NOT NULL,english_dna JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS learning_events (id UUID PRIMARY KEY,learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,event_type TEXT NOT NULL,payload JSONB NOT NULL,occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS user_accounts (id UUID PRIMARY KEY,learner_id UUID UNIQUE NOT NULL REFERENCES learners(id) ON DELETE CASCADE,email TEXT UNIQUE NOT NULL,display_name TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS sessions (id UUID PRIMARY KEY,user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,token_hash TEXT UNIQUE NOT NULL,expires_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS review_cards (id UUID PRIMARY KEY,learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,skill TEXT NOT NULL,prompt TEXT NOT NULL,answer TEXT,interval_days INTEGER NOT NULL DEFAULT 1,ease NUMERIC NOT NULL DEFAULT 2.5,repetitions INTEGER NOT NULL DEFAULT 0,due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS learner_privacy_preferences (learner_id UUID PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,analytics BOOLEAN NOT NULL DEFAULT TRUE,personalized_ai BOOLEAN NOT NULL DEFAULT TRUE,voice_processing BOOLEAN NOT NULL DEFAULT FALSE,voice_retention_days INTEGER NOT NULL DEFAULT 7 CHECK (voice_retention_days BETWEEN 0 AND 365),share_for_human_review BOOLEAN NOT NULL DEFAULT FALSE,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS voice_consents (id UUID PRIMARY KEY,learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,purpose TEXT NOT NULL,provider_disclosure TEXT NOT NULL,consented BOOLEAN NOT NULL,consented_at TIMESTAMPTZ,revoked_at TIMESTAMPTZ,deletion_requested_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS evidence_records (id UUID PRIMARY KEY,learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,source_type TEXT NOT NULL,skill TEXT NOT NULL,objective_id TEXT,evidence JSONB NOT NULL,score NUMERIC,transfer BOOLEAN NOT NULL DEFAULT FALSE,occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS content_versions (id UUID PRIMARY KEY,entity_id TEXT NOT NULL,kind TEXT NOT NULL,version TEXT NOT NULL,parent_version TEXT,created_by TEXT NOT NULL,change_summary TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(entity_id,kind,version));
CREATE TABLE IF NOT EXISTS knowledge_sources (id UUID PRIMARY KEY,title TEXT NOT NULL,source_type TEXT NOT NULL,rights TEXT NOT NULL,approved_for_rag BOOLEAN NOT NULL DEFAULT FALSE,url TEXT,consulted_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS knowledge_documents (id UUID PRIMARY KEY,source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,title TEXT NOT NULL,body TEXT NOT NULL,content_hash TEXT NOT NULL,version TEXT NOT NULL DEFAULT '1',level TEXT,objective_id TEXT,approved_for_rag BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(source_id,content_hash));
CREATE TABLE IF NOT EXISTS audit_events (id UUID PRIMARY KEY,learner_id UUID REFERENCES learners(id) ON DELETE SET NULL,actor_id TEXT NOT NULL,action TEXT NOT NULL,entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,metadata JSONB NOT NULL DEFAULT '{}'::jsonb,occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS observability_events (id UUID PRIMARY KEY,name TEXT NOT NULL,severity TEXT NOT NULL,trace_id TEXT NOT NULL,duration_ms INTEGER,route TEXT,safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS experiments (id UUID PRIMARY KEY,name TEXT NOT NULL,hypothesis TEXT NOT NULL,status TEXT NOT NULL,control TEXT NOT NULL,variants JSONB NOT NULL DEFAULT '[]'::jsonb,primary_learning_metric TEXT NOT NULL,guardrail_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE experiments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE TABLE IF NOT EXISTS entitlements (learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,tier TEXT NOT NULL,feature TEXT NOT NULL,quota INTEGER,used INTEGER NOT NULL DEFAULT 0,reset_at TIMESTAMPTZ,PRIMARY KEY(learner_id,feature));
CREATE TABLE IF NOT EXISTS ai_usage_daily (learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,usage_date DATE NOT NULL DEFAULT CURRENT_DATE,estimated_cents INTEGER NOT NULL DEFAULT 0,request_count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY (learner_id, usage_date));
CREATE TABLE IF NOT EXISTS ai_response_cache (cache_key TEXT PRIMARY KEY,model TEXT NOT NULL,payload JSONB NOT NULL,hit_count INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),last_hit_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS subscriptions (learner_id UUID PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE','PLUS','PRO')),status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED','PAUSED','PAST_DUE','TRIALING')),provider TEXT NOT NULL DEFAULT 'NONE',external_reference TEXT,period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),period_end TIMESTAMPTZ,cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS learning_events_learner_time_idx ON learning_events (learner_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS diagnostic_attempts_learner_time_idx ON diagnostic_attempts (learner_id,created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS review_cards_due_idx ON review_cards(learner_id,due_at);
CREATE INDEX IF NOT EXISTS voice_consents_learner_idx ON voice_consents(learner_id,created_at DESC);
CREATE INDEX IF NOT EXISTS evidence_records_learner_time_idx ON evidence_records(learner_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_time_idx ON audit_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS observability_events_time_idx ON observability_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS content_versions_entity_idx ON content_versions(entity_id,kind,created_at DESC);
CREATE INDEX IF NOT EXISTS ai_usage_daily_date_idx ON ai_usage_daily(usage_date,learner_id);
CREATE INDEX IF NOT EXISTS knowledge_documents_source_idx ON knowledge_documents(source_id,version);
CREATE TABLE IF NOT EXISTS certificates (id UUID PRIMARY KEY,learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,display_name TEXT NOT NULL,level TEXT NOT NULL,overall_percent INTEGER NOT NULL,issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),revoked BOOLEAN NOT NULL DEFAULT FALSE);

CREATE TABLE IF NOT EXISTS streak_state (learner_id UUID PRIMARY KEY REFERENCES learners(id) ON DELETE CASCADE,freezes INTEGER NOT NULL DEFAULT 2,bridged_on DATE,last_bridged_gap INTEGER NOT NULL DEFAULT 0,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- Migration: older databases carry a status CHECK without PAUSED; rebuild the constraint idempotently.
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('ACTIVE','CANCELLED','PAUSED','PAST_DUE','TRIALING'));
