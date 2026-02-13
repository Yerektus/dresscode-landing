# E2E smoke scenarios

1. Login flow
- Open `/auth/sign-in`
- Login by email/password
- Assert redirect to `/app`

2. Try-on flow
- Upload user photo
- Fill valid profile data
- Add wardrobe item
- Run try-on and verify result screen

3. Billing flow
- Open billing sheet
- Start checkout
- Verify polling updates status and credits after success

4. Payment callbacks
- Open `/payment/success` with `pending_payment_id_v1` in localStorage
- Verify balance refresh and redirect to `/app`
- Open `/payment/cancel` and verify pending id is cleared

5. Viewport smoke
- Mobile: `390x844`
- Desktop: `1440x900`
- Ensure layout integrity and sticky CTA behavior

6. Social publish + comment
- Login and open `/app/publish`
- Publish look with image, title, description
- Verify redirect to `/app/profile?tab=looks`
- Open published look from profile grid
- Add top-level comment
- Verify comment appears in thread

7. Social public profile + follow
- Open another user profile `/app/users/{userId}?tab=looks`
- Click Follow
- Verify button state changes to Unfollow
- Verify followers counter increments

8. Social reply depth guard
- Open look detail `/app/looks/{lookId}`
- Reply to top-level comment
- Verify reply appears under parent
- Verify UI does not show reply action for level-2 reply (no level-3 nesting)

9. Server draft autosave
- Set `NEXT_PUBLIC_SOCIAL_DRAFT_ENABLED=true`
- Open `/app/publish`, change title/description/tags
- Wait for autosave status "Сохранено ..."
- Reload page and verify draft fields restored from backend

10. Draft feature disabled
- Set `NEXT_PUBLIC_SOCIAL_DRAFT_ENABLED=false`
- Open `/app/publish`
- Verify draft status is hidden
- Verify publish flow remains available and functional
