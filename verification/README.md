URL checked: https://kwibbeler.github.io
When: Friday September 18th 2026 at 5:19 PM. 
What would have made this fail: One thing that actually did fail when I was developing is the first fetch right after pushing returned a 404 for phases.html, because Pages was still deploying the new commit and was serving the old template. I waited and refetched, and it returned 200. 
