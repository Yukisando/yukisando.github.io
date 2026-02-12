# yukisando.github.io

Personal website hosted on GitHub Pages.

## Manual Deployment

This repository includes a manual deployment workflow that allows you to trigger a fresh deploy to GitHub Pages at any time.

### How to Trigger a Manual Deployment

1. Go to the **Actions** tab in this repository
2. Select the **"Manual Deploy to GitHub Pages"** workflow from the left sidebar
3. Click the **"Run workflow"** button
4. Select the branch you want to deploy (typically `master`)
5. Click **"Run workflow"** to start the deployment

The workflow will:
- Check out the latest commit from the selected branch
- Prepare the site artifacts
- Deploy to GitHub Pages

You can monitor the deployment progress in the Actions tab and access the deployed site once complete.

## Development

This is a static website. To make changes:

1. Edit the HTML, CSS, or JavaScript files directly
2. Commit and push your changes
3. Trigger a manual deployment using the workflow above

## License

See the original template license in `package.json`.
