import express from 'express'
import mysql from 'mysql2/promise' // <--- 1. CAMBIO CLAVE: Usar /promise

const app = express()
const PORT = process.env.SERV_PORT || 3000
const SALUDO = process.env.SALUDO || '¡Hola desde Node.js dentro de docker!🐋'



async function conectar() { 
try {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST, //Entre contenedores
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT //Entre contenedores
  });
  console.log('Conexión exitosa a MySQL ✅');
  return conexion;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    // Aquí puedes decidir si quieres relanzar el error o retornar null
    throw error; 
  }
}

app.get('/',(req,res) =>
{
    res.json(
        {
            mensaje: SALUDO,
            hostname: process.env.HOSTNAME, //Coge el hostname por defecto del sistema, antes que el mio
            timestamp: new Date().toISOString(),
        }
    )
})

app.get('/lista', async (req, res) => { // 1. Añade 'async' aquí
    try {
        // 2. Añade 'await' para "desempaquetar" la promesa y obtener la conexión real
        const conexion = await conectar(); 

        // Ahora sí, ya puedes usarla con total normalidad y autocompletado
        const [rows] = await conexion.execute('SELECT * FROM ARTICULOS');

        // Recuerda cerrar la conexión cuando termines de usarla en la petición
        await conexion.end();

        res.json(rows); // Envías el resultado al cliente

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los artículos' });
    }
});
//Enpoint de salud, util para HEALTHCHECK y orquestadores
app.get('/health',(req,res) =>
{
    console.log('Hola estoy en la peticion get /health')
    res.status(200).json({status:'ok'})
})

app.get('/conectar',(req,res) =>
{
  let conexion = conectar(); 
  res.status(200).json({status:'ok'})
})





app.listen(PORT,() =>
{
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
})



//CREAR LA RED
//docker create network MIRED


//IMAGEN node Dockerfile
//docker build -t imagen_node .

//CONTENEDOR node
//docker run --name contenedor_node -p 5000:3000 --network MIRED imagen_node

//IMAGEN mysql descarga
 //docker pull mysql:26.7

 //CONTENEDOR mysql
 //docker run --name mi-mysql -p 3307:3306 --network MIRED -e MYSQL_ROOT_PASSWORD=admin mysql:26.7

 //Siguiente paso seria crear la base de datos con la tabla

 //Luego probar los endpoints