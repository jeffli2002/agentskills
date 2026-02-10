@echo off
echo ================================================
echo Promo Video Screen Recording Script
echo ================================================
echo.
echo INSTRUCTIONS:
echo 1. Open http://localhost:3009 in Chrome
echo 2. Click on "PromoVideo" composition
echo 3. Make sure the timeline is at frame 0
echo 4. Press F to enter fullscreen mode in Remotion
echo 5. Come back here and press any key to start recording
echo 6. Immediately go back to Chrome and press SPACE to play
echo.
pause

echo.
echo Recording desktop for 62 seconds...
echo (Recording started - go play the video NOW!)
echo.

cd /d D:\AI\agentskills\apps\promo-video

ffmpeg -y -f gdigrab -framerate 30 -video_size 1920x1080 -offset_x 0 -offset_y 0 -i desktop -t 62 -c:v libx264 -preset ultrafast -crf 18 out\temp-video.mp4

echo.
echo Screen recording complete!
echo Now combining with audio...
echo.

REM Combine all voice files into one
ffmpeg -y -i "public/audio/01-intro.mp3" -i "public/audio/02-hero.mp3" -i "public/audio/03-browse.mp3" -i "public/audio/04-create.mp3" -i "public/audio/05-questions.mp3" -i "public/audio/06-workflow.mp3" -i "public/audio/07-generate.mp3" -i "public/audio/08-publish.mp3" -i "public/audio/09-myskills.mp3" -i "public/audio/10-outro.mp3" -filter_complex "[0:a]adelay=0|0[a0];[1:a]adelay=3000|3000[a1];[2:a]adelay=7000|7000[a2];[3:a]adelay=10000|10000[a3];[4:a]adelay=17000|17000[a4];[5:a]adelay=23000|23000[a5];[6:a]adelay=32000|32000[a6];[7:a]adelay=38000|38000[a7];[8:a]adelay=46000|46000[a8];[9:a]adelay=55000|55000[a9];[a0][a1][a2][a3][a4][a5][a6][a7][a8][a9]amix=inputs=10:duration=longest[voice]" -map "[voice]" -t 60 out\temp-voice.mp3

echo Mixing voice with background music...
ffmpeg -y -i out\temp-video.mp4 -i out\temp-voice.mp3 -i "public/audio/background-music.mp3" -filter_complex "[1:a]volume=1.0[voice];[2:a]volume=0.15[music];[voice][music]amix=inputs=2:duration=first[audio]" -map 0:v -map "[audio]" -c:v copy -c:a aac -b:a 192k -shortest out\promo-video.mp4

echo.
echo ================================================
echo DONE! Video saved to: out\promo-video.mp4
echo ================================================
echo.

REM Cleanup temp files
del out\temp-video.mp4 2>nul
del out\temp-voice.mp3 2>nul

pause
