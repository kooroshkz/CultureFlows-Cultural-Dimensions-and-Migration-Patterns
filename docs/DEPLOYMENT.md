# Deploy to GitHub Pages

## Steps to deploy your CultureFlows dashboard to GitHub Pages:

### 1. Prepare the Repository
```bash
# Make sure you're in the main project directory
cd /path/to/CultureFlows-Cultural-Dimensions-and-Migration-Patterns

# Add all website files to git
git add website/
git commit -m "Add interactive web dashboard"
git push origin main
```

### 2. Enable GitHub Pages
1. Go to your GitHub repository settings
2. Scroll down to "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch
5. Select "/ (root)" folder
6. Click "Save"

### 3. Configure for Subdirectory Deployment
Since the website is in the `website/` folder, you have two options:

#### Option A: Move files to root (Recommended)
```bash
# Copy website files to root
cp -r website/* .
git add .
git commit -m "Move website to root for GitHub Pages"
git push origin main
```

#### Option B: Use docs folder
```bash
# Rename website folder to docs
mv website docs
git add .
git commit -m "Rename website to docs for GitHub Pages"
git push origin main
```
Then in GitHub Pages settings, select "docs" folder instead of root.

### 4. Access Your Dashboard
After deployment (usually takes 5-10 minutes), your dashboard will be available at:
`https://yourusername.github.io/repository-name`

### 5. Custom Domain (Optional)
If you have a custom domain:
1. Add a `CNAME` file with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Troubleshooting

### Common Issues:
1. **404 Error**: Make sure files are in the correct location (root or docs folder)
2. **CSS/JS not loading**: Check file paths are relative (no leading slash)
3. **CSV data not loading**: Ensure the data file is included in the repository

### Testing Locally:
```bash
cd website  # or docs, depending on your setup
python3 dev_server.py
# Open http://localhost:8080 in your browser
```

### File Structure for GitHub Pages:
```
repository-root/
├── index.html          # Main page
├── assets/
│   ├── styles.css
│   └── app.js
├── components/
│   ├── world-map.js
│   ├── cultural-chart.js
│   ├── migration-chart.js
│   └── data-table.js
├── data/
│   └── masterdata.csv
└── README.md
```

## Performance Tips

1. **Enable compression**: GitHub Pages automatically serves compressed files
2. **Optimize images**: Use WebP format for any images
3. **Minimize external dependencies**: Currently using D3.js and TopoJSON from CDN
4. **Browser caching**: Static files are automatically cached by GitHub Pages

## Security Notes

- All data is served as static files
- No server-side processing required
- HTTPS is automatically enabled
- No sensitive data should be included in the repository