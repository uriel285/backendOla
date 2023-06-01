var pool = require('../bd')

async function getComentarios(){
    var query = "select * from comentarios order by id desc";
    var rows = await pool.query(query);
    return rows
}

async function insertComentarios(obj) {
    try{
        var query = "insert into comentarios set ?";
        var rows = await pool.query(query, obj);
        return rows;
    }
    catch (error){
        console.log(error);
        throw error;
    }
}

async function deleteComentariosById(id){
    var query = "delete from comentarios where id = ?";
    var rows = await pool.query(query, [id]);
    return rows
};

async function getComentariosById(id){
    var query = "select * from comentarios where id = ?";
    var rows = await pool.query(query, [id]);
    return rows[0];
};

async function modificarComentariosById(obj, id){
    try{
        var query = "update comentarios set ? where id = ?";
        var rows = await pool.query(query, [obj, id]);
        return rows;
    }
    catch(error){
        throw error;
    }
};

module.exports = {getComentarios, insertComentarios, deleteComentariosById, getComentariosById, modificarComentariosById}