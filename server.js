"use strict";
var fs = require('fs');

const express = require('express');

const app = express();

/**
 * Ordena elementos del JSON
 *  @param data json
 *  @param key nombre clave (se ordenara dependiendo de su valor)
 *  @param orden tipo de ordenacion
 *  @return json ordenado
 */
function sortJSON(data, key, orden) 
{
    return data.sort(function (a, b) 
    {
        var x = a[key],
        y = b[key];

        if (orden === 'asc') 
        {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        
        if (orden === 'desc') 
        {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}

app.listen(3000, () => 
{
    console.log('Aplicacion corriendo en el puerto 3000.')
})

// Middleware, facilita el uso de req y res (para el tratamiento de datos)
const bodyParser = require('body-parser');

// Lectura de contenido en una solicitud
app.use(bodyParser.json());
// HTML POST FORM
app.use(bodyParser.urlencoded({extended:true}));

// Directorio de archivos estaticos
app.use(express.static('./public'));

// Acceso a la raiz de la app
app.get('/', (req, res) => 
{
    res.setHeader('Content-type', 'text/html');
    res.sendFile('./public/index.html');
})

// Envia el archivo JSON para que se puedan mostrar los mangas en el cliente
app.get('/get-mangas', (req, res) => {

    const file = fs.readFileSync('./JSON/mangas.json', 'UTF-8');
    res.setHeader('Content-type', 'text/json');
    res.send(file);
})

// Añade un nuevo manga al JSON
app.post('/new', (req, res) => 
{
    res.setHeader('Content-type', 'text/plain');

    // obtener datos
    const titulo = req.body.nombreManga;
    const capitulos = req.body.capitulosManga;
    const nota = req.body.notaManga;
    const anyo = req.body.anyoManga;
    const idioma = req.body.idiomaManga;

    // abrir archivo
    let file = fs.readFileSync('./JSON/mangas.json', 'UTF-8');
    // convertirlo 
    let json = JSON.parse(file);
    // insertar nuevo elemento
    json.mangas.push({"titulo":titulo, "capitulos": parseInt(capitulos), "nota": parseFloat(nota), "anyo": parseInt(anyo),
     "idioma": idioma, "vocabulario":[{}]});
    // guardar json
    file = fs.writeFileSync('./JSON/mangas.json', JSON.stringify(json, null, 2));

    // informar
    res.send('Datos guardados.');
})

// Elimina los mangas seleccionados
app.post('/remove', (req, res) =>
{
    res.setHeader('Content-type', 'text/plain');
    var nuevaPos = 0;

    const check = req.body.check;

     // abrir archivo
     let file = fs.readFileSync('./JSON/mangas.json', 'UTF-8');
     // convertirlo a un arreglo
     let json = JSON.parse(file);
     // eliminar elementos seleccionados
     check.forEach(pos => 
    {
        json.mangas.splice(pos-nuevaPos,1);
        nuevaPos++;
    })
    // guardar json
     file = fs.writeFileSync('./JSON/mangas.json', JSON.stringify(json,null,2));
    
    // informar
     res.send('Datos eliminados');
})

// Actualiza los valores de un manga
app.post('/update', (req, res) => 
{
    res.setHeader('Content-type', 'text/plain');
    var pos = -1;
    var final = false;
    
    const titulo = req.body.nombreManga;
    const nota = req.body.notaManga;
    const anyo = req.body.anyoManga;
    const idioma = req.body.idiomaManga;

    // abrir archivo
    let file = fs.readFileSync('./JSON/mangas.json', 'UTF-8');
    // convertir
    let json = JSON.parse(file);

    // obtener indice
    json.mangas.forEach(mangas => 
    {
        if(!final)
        {   
            pos++;
            if(mangas.titulo == titulo)
            {
                final=true;
            }
        }  
    })

    // modificar elemento
    json.mangas[pos].titulo = titulo; 
    json.mangas[pos].nota = parseFloat(nota); 
    json.mangas[pos].anyo = parseInt(anyo);
    json.mangas[pos].idioma = idioma;  

    // guardar json
    file = fs.writeFileSync('./JSON/mangas.json', JSON.stringify(json,null,2));
    // informar
    res.send('Datos guardados.');
})

// Ordena los elementos de una lista
app.post('/sort', (req, res) => 
{
    res.setHeader('Content-type', 'text/plain');

    // obtiene la informacion necesaria del cliente
    const key = req.body.key;
    var orden = 'asc';

    // abrir archivo
    let file = fs.readFileSync('./JSON/mangas.json', 'UTF-8');
    // convertirlo 
    let json = JSON.parse(file);

    /* Ordena el JSON dependiendo del tipo de clave */ 
    var valor1 = json.mangas[0][key]; 
    var valor2 = json.mangas[json.mangas.length-1][key];

    if(valor1 < valor2)
    {
        orden = 'desc';

    }
    else if (valor1 > valor2)
    {
        orden = 'asc';
    }

    // transformar JSON 
    json.mangas = sortJSON(json.mangas, key, orden);
    // guardar json
    file = fs.writeFileSync('./JSON/mangas.json', JSON.stringify(json, null, 2));

    // informar
    res.send('Datos guardados.');
})