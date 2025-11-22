# Git Setup Guide

Follow these steps to upload your Manga Narrator extension to GitHub.

## Prerequisites

- Git installed on your computer ([Download Git](https://git-scm.com/downloads))
- GitHub account ([Sign up](https://github.com/join))

## Step 1: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `manga-narrator`
   - **Description**: "AI-powered Chrome extension that narrates manga with human-like voices"
   - **Visibility**: Public (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Initialize Git in Your Project

Open a terminal/command prompt in your project directory and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Manga Narrator Chrome Extension"
```

## Step 3: Connect to GitHub

Replace `yourusername` with your actual GitHub username:

```bash
# Add remote repository
git remote add origin https://github.com/yourusername/manga-narrator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Add Demo Assets

1. Create your demo assets (see `demo/README.md` for guidelines):
   - Banner image (`demo/banner.png`)
   - Screenshots (`demo/popup-screenshot.png`, etc.)
   
2. Add and commit them:

```bash
git add demo/
git commit -m "Add demo assets and screenshots"
git push
```

## Step 5: Add Demo Video

1. Record your demo video (30-60 seconds)
2. Go to your GitHub repository
3. Click on "Issues" tab
4. Click "New issue"
5. Drag and drop your video into the issue description
6. GitHub will upload it and give you a URL like:
   ```
   https://github.com/user-attachments/assets/abc123...
   ```
7. Copy this URL
8. Close the issue (you don't need to create it)
9. Update `README.md` with the video URL
10. Commit and push:

```bash
git add README.md
git commit -m "Add demo video link"
git push
```

## Step 6: Update README with Your Info

Edit `README.md` and replace:
- `yourusername` with your GitHub username
- `@yourtwitter` with your Twitter handle (or remove)
- `Your Name` with your actual name

Then commit:

```bash
git add README.md
git commit -m "Update README with personal information"
git push
```

## Common Git Commands

```bash
# Check status
git status

# Add specific files
git add filename.js

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Troubleshooting

### Authentication Issues

If you get authentication errors, you may need to:

1. **Use Personal Access Token** (recommended):
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use the token as your password when pushing

2. **Or use SSH**:
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to GitHub: Settings → SSH and GPG keys → New SSH key
   # Then change remote URL:
   git remote set-url origin git@github.com:yourusername/manga-narrator.git
   ```

### Large Files

If you have large demo videos, consider:
- Uploading directly to GitHub (as described in Step 5)
- Or using [Git LFS](https://git-lfs.github.com/)

## Next Steps

After uploading to GitHub:

1. ✅ Add topics to your repository (chrome-extension, openai, manga, tts, ai)
2. ✅ Enable GitHub Pages if you want a project website
3. ✅ Add a CONTRIBUTING.md if you want contributors
4. ✅ Create issues for future enhancements
5. ✅ Share your project on social media!

## Need Help?

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Community](https://github.community)
