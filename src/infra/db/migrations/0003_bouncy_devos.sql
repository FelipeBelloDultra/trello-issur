CREATE INDEX "account_roles_workspace_idx" ON "account_roles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "account_roles_role_idx" ON "account_roles" USING btree ("role_id");