var express = require("express");
const fs = require("fs");
let fsExtra = require("fs-extra");
let {PythonShell} = require('python-shell');


var router = express.Router();

TRACKS_PATH = "./public/multitrack/"


router.get("/",function(req,res){
    res.render('index', {
        data: {
            player : false  
        },
        errors: {}
    });
});



router.get("/mt5Player", async (req, res) => {
  const name = req.query.name;
  let source = "./spleeter-tool/output/"+name;
  let destination = TRACKS_PATH+name;

  // copy source folder to destination
  fsExtra.copy(source, destination, function (err) {
    if (err){
        console.log('An error occured while copying the folder.')
        return console.error(err)
    }
    console.log('Copy completed!')
  });

  res.render("player");
});

router.post("/musicFileFromWeb",function(req,res){
    if(req.files){
        var file = req.files.musicFile;
        const path = "./spleeter-tool/spleeter/songs/"+file.name
        fileName = file.name.split(".");
        name = fileName[0].replace(/[^A-Z0-9]/ig, "");
        var re = /(?:\.([^.]+))?$/;
        fileFormat = re.exec(file.name)[1];
        fileName = name+"."+fileFormat
        file.mv(path,function(err){
            if(err){
                console.log(err);
            }else{
                
                const newpath = "./spleeter-tool/spleeter/songs/"+fileName
                fs.renameSync(path,newpath);


                var options = {
                    mode: 'text',
                    pythonOptions: ['-u'],
                    // make sure you use an absolute path for scriptPath
                    scriptPath: 'spleeter-tool/spleeter/',
                    args: [fileName,req.body.stems] //['val1','val2']
                  };
                
                  PythonShell.run('run.py', options, function (err, results) {
                    if (err) throw err;
                    // results is an array consisting of messages collected during execution
                    for(var i =0;i<results.length;i++){
                        console.log('results: ', results[i]);
                    }

                    /*try {
                        fs.unlinkSync(path)
                        //file removed
                    } catch(err) {
                        console.error(err)
                    }*/

                    //res.redirect('/')
                    res.render('index', {
                        data: {
                            player : true,
                            name :results[0].split(".")[0]
                        },
                        errors: {}
                    });
                  });
            }
        })
    }else{
        if(req.body.youtubeLink !=""){
            var options = {
                mode: 'text',
                pythonOptions: ['-u'],
                // make sure you use an absolute path for scriptPath
                scriptPath: 'spleeter-tool/spleeter',
                args: [req.body.youtubeLink,req.body.stems] //['val1','val2']
              };
            
              PythonShell.run('run.py', options, function (err, results) {
                if (err) throw err;
                // results is an array consisting of messages collected during execution
                //console.log('results: %j', results);
                for(var i =0;i<results.length;i++){
                    console.log('results: ', results[i]);
                }

                res.render('index', {
                    data: {
                        player : true,
                        name :results[0].split(".")[0]
                    },
                    errors: {}
                });
              });
    
              
        }else{
            res.redirect('/')
        }
           

    }
});




// player routing
router.get("/track", async (req, res) => {
    const trackList = await getTracks();
  
    if (!trackList) {
      return res.send(404, "No track found");
    }
  
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(trackList));
    res.end();
  });
  
  // routing
  router.get("/track/:id", async (req, res) => {
    const id = req.params.id;
    const track = await getTrack(id);
  
    if (!track) {
      return res.send(404, 'Track not found with id "' + id + '"');
    }
  
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(track));
    res.end();
  });
  
  const getTracks = async () => {
    const directories = await getFiles(TRACKS_PATH);
    return directories.filter(dir => !dir.match(/^.DS_Store$/));
  };
  
  const endsWith = (str, suffix) => str.indexOf(suffix, str.length - suffix.length) !== -1;
  
  isASoundFile = fileName => {
    if (endsWith(fileName, ".mp3")) return true;
    if (endsWith(fileName, ".ogg")) return true;
    if (endsWith(fileName, ".wav")) return true;
    if (endsWith(fileName, ".m4a")) return true;
    return false;
  };
  
  const getTrack = async id =>
    new Promise(async (resolve, reject) => {
      if (!id) reject("Need to provide an ID");
  
      const fileNames = await getFiles(`${TRACKS_PATH}/${id}`);
  
      if (!fileNames) {
        reject(null);
      }
  
      fileNames.sort();
  
      const track = {
        id: id,
        instruments: fileNames
          .filter(fileName => isASoundFile(fileName))
          .map(fileName => ({
            name: fileName.match(/(.*)\.[^.]+$/, "")[1],
            sound: fileName
          }))
      };
  
      resolve(track);
    });
  
  const getFiles = async dirName =>
    new Promise((resolve, reject) =>
      fs.readdir(dirName, function(error, directoryObject) {
        if (error) {
          reject(error);
        }
  
        if (directoryObject !== undefined) {
          directoryObject.sort();
        }
        resolve(directoryObject);
      })
    );
  


module.exports = router;