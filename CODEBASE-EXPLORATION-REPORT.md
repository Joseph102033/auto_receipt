# Codebase Exploration Report: Document Submission Management System

Date: November 7, 2025
Project: kosha_easy (차수별 문서 제출 관리 시스템)
Status: Early Development Phase

---

## QUICK FINDINGS

### Database Schema Status
- File: C:\Users\USER\Code\Code\kosha_easy\supabase\migrations\0001_initial_schema.sql
- Total tables: 6 (profiles, rounds, round_participants, submissions, notifications, notification_templates)
- Submissions table fields: id, round_id, participant_id, document_name, file_url, file_size, file_type, status, not_applicable_reason, submitted_at, created_at, updated_at

### Expense/Amount Fields
- Status: NOT FOUND in any schema, types, or API
- Korean terms searched: 운임, 숙박, expense, amount, cost
- Result: ZERO occurrences across entire codebase
- Conclusion: No expense tracking implemented or designed

### File Upload Status
- Current State: UI component only (src/components/ui/file-upload.tsx)
- Supabase Storage Integration: NOT IMPLEMENTED
- Submission Record Creation: MOCK ONLY (shows toast, no database insert)
- Page: src/app/participant/rounds/[id]/submit/page.tsx

