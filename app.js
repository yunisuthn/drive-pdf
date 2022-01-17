// Imports
const express = require('express');
const { json } = require('express/lib/response');
const app = express();
const { google } = require('googleapis');
const port = 8081;


// Fichier static a utiliser
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
// View de type html
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');


// app.set('views', './views')
// app.set('view engine', 'ejs')

//Googleapi
const CLIENT_ID ="13056989274-d276051fndh9vl7jglvrj8vbpuv9tfmf.apps.googleusercontent.com";
const CLIENT_SECRET ="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";
const REDIRECT_URL ="https://developers.google.com/oauthplayground";

const REFRESH_TOKEN ="1//041DuuckB1KOdCgYIARAAGAQSNwF-L9IrtCeduHvCQ3aJMTFN_ofvS6krf-c5eti2eVWfLObnN865fq57PewZfomBYKpjokT7pNM";
const oauth2client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
oauth2client.setCredentials({refresh_token : REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3',
    auth: oauth2client
})
//Fonction pour prendre le contenu du drive a partir d'un id specifique
async function GetFile(id){
    var fileId=id;
    try {
        const response = await drive.files.list({
            includeRemoved: false,
            withLink: true,
            spaces: 'drive',
            fileId: fileId,
            fields: 'nextPageToken, files(id, name)',
            q: `'${fileId}' in parents`
        });
       return response.data;

        
    } catch (error) {
        console.log(error.message);
    }
}
//Variable pour les dossier et le lien du pdf
var allFolder;
var pdflinks=[];
async function pushFiles(){
    
    allFolder = await GetFile('1Yl4pO9bJ76IPou1VEmArrn3I1MPG6O9t');
    for (i=0; i<allFolder.files.length; i++){
        var pdfid = await GetFile(allFolder.files[i].id);
        for (s=0;s<pdfid.files.length;s++){
            pdflinks.push(pdfid.files[s].id);
        }

    }
    return pdflinks;
}
//Variable pour les fichier a afficher et l'indexation
var allfiles;
var indice = 0;
//Page d'accueil
app.get('', async (req, res) => {
    if (indice == 0){
        allfiles = await pushFiles();
        var url = "https://drive.google.com/file/d/"+allfiles[indice]+"/preview";
        indice++;
        res.render('home.html',{obj:url});
    }
    else{
        var total = allfiles.length;
    if (indice < total){
        var url = "https://drive.google.com/file/d/"+allfiles[indice]+"/preview";
        indice++;
        res.render('home.html',{obj:url});
    }
    else{
        res.send("<h1>TRAITEMENT DES FICHIERS TERMINEE</h1>");
    }
    }
   
})
//Bouton next
app.get('/next', (req, res) => {
    var total = allfiles.length;
    if (indice < total){
        console.log(indice);
        var url = "https://drive.google.com/file/d/"+allfiles[indice]+"/preview";
        indice++;
        res.render('home.html',{obj:url});
    }
    else{
        res.send("<h1>TRAITEMENT DES FICHIERS TERMINEE</h1>");
    }
})

//  Ecouter le port 8081
app.listen(port, () => console.info(`Ecoute sur le port ${port}`))