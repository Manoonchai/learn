module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', // Analyze commits to determine version
    '@semantic-release/release-notes-generator', // Generate release notes
    '@semantic-release/changelog', // Generate CHANGELOG.md (Needs @semantic-release/changelog installed)
    [
      '@semantic-release/npm',
      {
        // Update package.json version
        npmPublish: false, // Don't public npm package
      },
    ],
    '@semantic-release/git', // Create commit with [skip ci] (Needs @semantic-release/git installed)
    '@semantic-release/github', // Create Github release & comment on issues, PRs
  ],
}
