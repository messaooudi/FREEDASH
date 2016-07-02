#!/bin/bash

X=$(xdotool search --name laser);
N=($X);

for wid in "${N[@]}"
do
	    xdotool windowkill $wid
done



