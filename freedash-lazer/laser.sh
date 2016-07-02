#!/bin/bash
WID=$(xdotool search --name laser)
xdotool windowraise  $WID
xdotool windowmove $WID $1 $2
