# Google Fonts URL Integration

The JSON2Video platform now supports direct Google Fonts URL integration, allowing you to use any Google Font by simply pasting the URL.

## Features

- **Direct URL Input**: Paste Google Fonts URLs directly into the font input
- **Auto-Detection**: Automatically detects and loads fonts from URLs
- **Multiple Font Support**: Extract and use multiple fonts from a single URL
- **Server-Side Rendering**: Fonts are automatically downloaded and used in video rendering
- **Fallback Support**: Graceful fallback to system fonts if loading fails

## How to Use

### Method 1: Direct URL Pasting
1. Select a text element
2. In the font input field, paste a Google Fonts URL
3. The font will be automatically detected and loaded
4. The font name will appear in the input field

### Method 2: URL Input Panel
1. Select a text element
2. Click the font dropdown
3. Click "Add Google Font URL" button
4. Paste your Google Fonts URL
5. Click "Load Font"

## Supported URL Formats

### Google Fonts CSS2 (Recommended)
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@300;400;500&display=swap
```

### Google Fonts CSS (Legacy)
```
https://fonts.googleapis.com/css?family=Inter:400,700|Roboto:300,400,500
```

### Single Font
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap
```

## Examples

### Popular Google Fonts URLs

**Inter Font:**
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap
```

**Roboto Font:**
```
https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap
```

**Open Sans Font:**
```
https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap
```

**Poppins Font:**
```
https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap
```

**Multiple Fonts:**
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@300;400;500&family=Open+Sans:wght@400;600&display=swap
```

## Technical Details

### Client-Side
- **URL Parsing**: Extracts font names from Google Fonts URLs
- **Auto-Loading**: Automatically loads fonts via `<link>` tags
- **Font Detection**: Supports both CSS2 and legacy CSS formats
- **Error Handling**: Graceful fallback for invalid URLs

### Server-Side
- **Font Download**: Automatically downloads font files during video rendering
- **Local Storage**: Fonts are cached locally for faster subsequent renders
- **FFmpeg Integration**: Fonts are used directly in video generation
- **Fallback System**: Uses system fonts if Google Fonts fail to load

### Font Extraction Logic
1. Parse URL to extract font family names
2. Handle URL encoding (spaces become `+`)
3. Support multiple fonts in single URL
4. Extract first font as primary selection

## File Structure

```
client/src/components/
└── FontInput.js          # Enhanced with URL support

server/services/
└── videoGenerator.js     # Font downloading and rendering
```

## Error Handling

- **Invalid URL**: Shows error message for non-Google Fonts URLs
- **Network Issues**: Graceful fallback to system fonts
- **Font Loading**: Continues with default font if custom font fails
- **Server Errors**: Logs errors and uses fallback fonts

## Best Practices

1. **Use CSS2 URLs**: Prefer the newer CSS2 format for better compatibility
2. **Include Weights**: Specify font weights you need (e.g., `wght@400;700`)
3. **Test Fonts**: Preview fonts before rendering videos
4. **Fallback Fonts**: Always have a backup font in mind
5. **Performance**: Use only the font weights you need

## Example Workflow

1. **Get Google Font URL**:
   - Go to [Google Fonts](https://fonts.google.com/)
   - Select your desired font
   - Copy the CSS import URL

2. **Use in JSON2Video**:
   - Add a text element
   - Paste the Google Fonts URL
   - Font loads automatically
   - Preview the text with new font

3. **Render Video**:
   - Font is automatically downloaded on server
   - Used in video rendering
   - Cached for future use

## Troubleshooting

### Font Not Loading
- Check if URL is valid Google Fonts URL
- Ensure internet connection
- Try refreshing the page
- Check browser console for errors

### Font Not Rendering in Video
- Check server logs for font download errors
- Verify font name is correctly extracted
- Try using a different font as test
- Check if font file was downloaded to server

### Performance Issues
- Use fewer font weights
- Avoid loading too many fonts at once
- Consider using system fonts for better performance 