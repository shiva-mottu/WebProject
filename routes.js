var express = require("express");
const fs = require("fs");
let {PythonShell} = require('python-shell');

var router = express.Router();

router.get("/",function(req,res){
    res.render("index");
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

                    //res.render("index");
                    res.redirect('/')
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
              });
    
              res.render("index");
        }else{
            res.redirect('/')
        }
           

    }
});

module.exports = router;