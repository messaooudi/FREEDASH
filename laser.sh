 #!/bin/bash
WID=$(xdotool search --name laser)
xdotool windowraise  $WID
xdotool windowmove --relative $WID $1 $2
