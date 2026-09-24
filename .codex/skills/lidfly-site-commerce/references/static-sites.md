# Static Sites

Use the static-site flow only for a static deployment, never for a managed page.

1. Read the current site and publication revision.
2. Change the original source project. Do not patch published HTML or emulate platform behavior with page CSS.
3. Upload an archive with `request_upload_archive`, then preview and inspect it.
4. Deploy through `lidfly_deploy_static_site` with the exact preview id, digest, revision and explicit replace confirmation.
5. Treat route collisions as blocking. A locked site must be unlocked by the owner in the browser.
6. Reread the site after deployment. Static forms may post to `/api/leads`; arbitrary server-side code is not supported.
