import os
import subprocess
import sys
import re


filePath = sys.argv[1]
stems = sys.argv[2]
path = os.path.join(os.getcwd(),"spleeter-tool")

if( filePath.startswith( 'https:') ):
    result = re.match('^[^v]+v=(.{11}).*', filePath)
    youtube_id = result.group(1)

    youtube_cmd = "youtube-dl -f bestaudio[ext=m4a] --get-filename "+ filePath +" --restrict-filenames"
    fileName = subprocess.check_output(youtube_cmd,shell=True).decode("utf-8").split(".")[0].split("-"+youtube_id)[0]+".mp3"
    print(fileName)

    youtube_cmd = "youtube-dl -x --audio-format mp3 "+ filePath +" -o /spleeter-tool/spleeter/songs/%(title)s.%(ext)s --restrict-filenames"
    subprocess.call(youtube_cmd)
else:
    fileName = filePath
    print(fileName)

#spleeter_cmd = "python -m spleeter separate -i  spleeter/songs/"+ fileName +".mp3 -p spleeter:"+stems+"stems -o output"
spleeter_cmd = "python -m spleeter separate -i  spleeter/songs/"+ fileName +" -p spleeter:"+stems+"stems -o output"
#print(spleeter_cmd)
subprocess.call(spleeter_cmd,shell=True, cwd = path)

print("Downloading is done......")