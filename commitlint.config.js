module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "build",
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "style",
                "looks",
                "revert",
                "test",
                "repo",
                "assets",
                "i18n",
                "a11y",
                "merge",
            ],
        ],
    },
    prompt: {
        questions: {
            type: {
                enum: {
                    assets: {
                        description:
                            "Addition or modification of assets unrelated to code (i.e. images, fonts, etc)",
                        title: "Assets",
                        emoji: "📚",
                    },
                    i18n: {
                        description:
                            "Changes related to localization and internationalization",
                        title: "Localization",
                        emoji: "🌍",
                    },
                    a11y: {
                        description: "Changes related to accessibility",
                        title: "Accessibility",
                        emoji: "♿",
                    },
                    git: {
                        description:
                            "Branch merges, MR/PR and other git shenanigans",
                        title: "Git Stuff",
                        emoji: "🔧",
                    },
                    repo: {
                        description:
                            "Changes relevant to the repository config, ownership and settings",
                        title: "Repository",
                        emoji: "📂",
                    },
                    looks: {
                        description:
                            "Development changes strictly related to end-user display and styling",
                        title: "Appeareance",
                        emoji: "🎨",
                    },
                    feat: {
                        description: "A new feature",
                        title: "Features",
                        emoji: "✨",
                    },
                    fix: {
                        description: "A bug fix",
                        title: "Bug Fixes",
                        emoji: "🐛",
                    },
                    docs: {
                        description: "Documentation only changes",
                        title: "Documentation",
                        emoji: "📚",
                    },
                    style: {
                        description:
                            "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
                        title: "Styles",
                        emoji: "💎",
                    },
                    tooling: {
                        description:
                            "A code change that neither fixes a bug nor adds a feature",
                        title: "Code Refactoring",
                        emoji: "📦",
                    },
                    perf: {
                        description: "A code change that improves performance",
                        title: "Performance Improvements",
                        emoji: "🚀",
                    },
                    test: {
                        description:
                            "Adding missing tests or correcting existing tests",
                        title: "Tests",
                        emoji: "🚨",
                    },
                    build: {
                        description:
                            "Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)",
                        title: "Builds",
                        emoji: "🛠",
                    },
                    ci: {
                        description:
                            "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)",
                        title: "Continuous Integrations",
                        emoji: "⚙️",
                    },
                    chore: {
                        description:
                            "Other changes that don't modify src or test files",
                        title: "Chores",
                        emoji: "♻️",
                    },
                    revert: {
                        description: "Reverts a previous commit",
                        title: "Reverts",
                        emoji: "🗑",
                    },
                },
            },
        },
    },
};
