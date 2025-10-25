#!/bin/bash
# Auto-confirm drizzle-kit push prompts
expect <<'EXPECT_SCRIPT'
spawn npm run db:push
expect {
    "Yes, I want to execute all statements" {
        send "\r"
        exp_continue
    }
    "No, abort" {
        send "\033\[B\r"
        exp_continue
    }
    eof
}
EXPECT_SCRIPT
