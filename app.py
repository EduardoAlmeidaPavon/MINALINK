from __future__ import annotations
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os
from werkzeug.utils import secure_filename

from flask import Flask, abort, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask import request, redirect, session

app = Flask(__name__)
app.secret_key = 'clave_secreta'

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:uHsWBNojbGmKIvQfiyEjFfRJJtaRHJkt@yamanote.proxy.rlwy.net:31918/railway'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# =========================
# MODELO USUARIO
# =========================
class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    identificador = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False)


# =========================
# MODELO AVISO
# =========================
class Aviso(db.Model):
    __tablename__ = 'avisos'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    descripcion_corta = db.Column(db.Text, nullable=False)
    imagen_portada = db.Column(db.String(255), nullable=False)
    fecha = db.Column(db.DateTime, server_default=db.func.now())
    fecha_evento = db.Column(db.Date, nullable=True)


# =========================
# RUTA INICIO
# =========================
@app.route('/')
def inicio():
    return render_template('index.html')


# =========================
# RUTA LOGIN
# =========================
@app.route('/login', methods=['POST'])
def login():
    identificador = request.form['identificador']
    password = request.form['password']

    usuario = Usuario.query.filter_by(
        identificador=identificador,
        password=password
    ).first()

    if usuario:
        session['usuario_id'] = usuario.id
        session['rol'] = usuario.rol
        return redirect('/Menu.html')

    return "Credenciales incorrectas"


# =========================
# RUTA GUARDAR AVISO
# =========================
@app.route('/guardar_aviso', methods=['POST'])
def guardar_aviso():
    titulo = request.form['titulo']
    categoria = request.form['categoria']
    descripcion = request.form['descripcion']
    file = request.files.get('imagen_file')
    imagen_url = request.form.get('imagen', '')
    if file and file.filename and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        imagen = '/uploads/' + filename
    else:
        imagen = imagen_url
    fecha = request.form.get('fecha')
    fecha_evento_str = request.form.get('fecha_evento')

    fecha_evento = None
    if fecha_evento_str:
        fecha_evento = datetime.fromisoformat(fecha_evento_str).date()
    elif fecha:
        fecha_evento = datetime.fromisoformat(fecha).date()

    zona_mexico = timezone(timedelta(hours=-6))
    fecha_publicacion = datetime.now(zona_mexico).replace(tzinfo=None)

    nuevo_aviso = Aviso(
        titulo=titulo,
        categoria=categoria,
        descripcion_corta=descripcion,
        imagen_portada=imagen,
        fecha=fecha_publicacion,
        fecha_evento=fecha_evento
    )

    db.session.add(nuevo_aviso)
    db.session.commit()

    origen = request.form.get('origen', 'admin')
    if origen == 'calendario':
        return redirect('/Calendario.html')
    return redirect('/AdministrarAvisos.html')


# =========================
# RUTA ACTUALIZAR AVISO
# =========================
@app.route('/actualizar_aviso/<int:id>', methods=['POST'])
def actualizar_aviso(id):
    aviso = Aviso.query.get_or_404(id)

    aviso.titulo = request.form['titulo']
    aviso.categoria = request.form['categoria']
    aviso.descripcion_corta = request.form['descripcion']
    file = request.files.get('imagen_file')
    if file and file.filename and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        aviso.imagen_portada = '/uploads/' + filename
    else:
        aviso.imagen_portada = request.form.get('imagen', aviso.imagen_portada)

    db.session.commit()

    return redirect('/AdministrarAvisos.html')


# =========================
# RUTA ELIMINAR AVISO
# =========================
@app.route('/eliminar_aviso/<int:id>', methods=['POST'])
def eliminar_aviso(id):
    aviso = Aviso.query.get_or_404(id)

    db.session.delete(aviso)
    db.session.commit()

    return redirect('/AdministrarAvisos.html')


# =========================
# RUTA ADMINISTRAR AVISOS
# =========================
@app.route('/AdministrarAvisos.html')
def administrar_avisos():
    avisos = Aviso.query.order_by(Aviso.fecha.desc()).all()
    return render_template('AdministrarAvisos.html', avisos=avisos)


# =========================
# RUTA VER AVISOS
# =========================
@app.route('/Avisos.html')
def ver_avisos():
    avisos = Aviso.query.order_by(Aviso.fecha.desc()).all()
    return render_template('Avisos.html', avisos=avisos)


# =========================
# NUEVA RUTA CALENDARIO
# =========================
@app.route('/Calendario.html')
def ver_calendario():
    avisos = Aviso.query.order_by(Aviso.fecha.asc()).all()
    rol = session.get('rol', 'usuario')
    return render_template('Calendario.html', avisos=avisos, rol=rol)


# =========================
# RUTA DETALLE AVISO
# =========================
@app.route('/detalle_aviso/<int:id>')
def detalle_aviso(id):
    aviso = Aviso.query.get_or_404(id)
    return render_template('detalle_aviso.html', aviso=aviso)


# =========================
# ARCHIVOS SUBIDOS
# =========================
@app.route('/uploads/<path:filename>')
def uploads(filename: str):
    return send_from_directory('uploads', filename)


# =========================
# ARCHIVOS CSS
# =========================
@app.route('/css/<path:filename>')
def css(filename: str):
    return send_from_directory('css', filename)


# =========================
# ARCHIVOS JS
# =========================
@app.route('/js/<path:filename>')
def js(filename: str):
    return send_from_directory('js', filename)


# =========================
# ARCHIVOS IMG
# =========================
@app.route('/img/<path:filename>')
def img(filename: str):
    return send_from_directory('img', filename)


# =========================
# RUTA MENU
# =========================
@app.route('/Menu.html')
def menu():
    ultimos_avisos = Aviso.query.order_by(Aviso.fecha.desc()).limit(3).all()
    return render_template('Menu.html', avisos=ultimos_avisos)


# =========================
# RENDER HTML GENERAL
# =========================
@app.route('/<path:page>')
def paginas_html(page: str):
    if not page.lower().endswith('.html'):
        abort(404)

    if page in ['Avisos.html', 'AdministrarAvisos.html', 'Calendario.html', 'Menu.html']:
        abort(404)

    template_path = Path(app.template_folder or 'templates') / page
    if not template_path.is_file():
        abort(404)

    return render_template(page)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)