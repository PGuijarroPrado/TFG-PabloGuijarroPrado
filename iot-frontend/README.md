# Desarrollo implementación de la entidad evento para la administración de elementos IoT en plataformas de despliegue de información de forma automática

## Descripción

En los últimos años el paradigma tecnológico de la Internet de las Cosas ha modificado totalmente el mercado de las telecomunicaciones. Desde dispositivos hardware hasta aplicaciones software han sido rediseñados por y para cumplir los requisitos de estos nuevos sistemas.

Dentro de este amplio mundo, los sistemas de bajos recursos y consumo limitado (y, por tanto, de gran vida útil) son uno de los temas con mayor demanda actual. Muchas plataformas e infraestructuras basadas en comunicaciones de baja energía o sistemas de consumo cero en reposo han aparecido en los últimos años, aunque su gestión aún no ha sido solucionada del todo. En concreto, los paneles de gestión basados en tecnologías web han sido los más investigados, y los que mejor posicionamiento tienen para dar el inminente salto comercial.

## Uso

Cuentas de acceso recomendadas:

* **Administrador:** Usuario: admin - Contraseña: 1234

## Manual

Existen dos tipos de cuentas:

1. Administrador
3. Usuario

Las funciones y acciones que puede llevar a cabo cada tipo de cuenta son distintas. La cuenta de administrador tiene acceso a todos los recursos del sistema mientras que la de usuario tiene acceso únicamente a un grupo limitado recursos que puede gestionar. Además la cuenta de adminstrador se encarga de gestionar la configuración del sistema y de dar de alta nuevos usuarios.

### Administrador

Las acciones que se pueden realizar desde una cuenta de administrador son:

* Dar de alta un dispositivo físico: Puede dar de alta un dispositivo físico y asignarlo a una puerta de enlace ya configurada. Además puede elegir que grupo de gestión se encargará de controlar la información que se verá representada en dicho dispositivo.

* Dar de alta una puerta de enlace: Una puerta de enlace sirve como conexión entre el sistema y los distintos dispositivos físicos. Se encarga de varios dispositivos físicos a la vez. La función del administrador será dar de alta dicha puerta de enlace y asignarle un conjunto de dispositivos físicos.

* Dar de alta usuarios o modificar los atributos de los usuarios existentes. Entre estos atributos se encuentran:
  * Nombre de usuario
  * E-mail del usuario
  * Contraseña de acceso del usuario
  * Permisos de administrador del usuario (determina si el usuario será un administrador o un usuario)
  * Grupo de gestión del usuario (determina sobre qué grupo de recursos tendrá control el usuario desde su cuenta)

* Dar de alta un grupo de gestión: Un grupo de gestión es un conjunto de usuarios que tienen acceso a un conjunto de dispositivos físicos determinado para su gestión. El administrador determina que dispositivos físicos están disponibles para gestionar por qué grupo de usuarios.

* Dar de alta una nueva localización: La localización es un parámetro que se asigna a las puertas de enlace y que determinan su posición geográfica dentro del espacio del sistema.

* Dar de alta una nueva resolución: La resolución es un parámetro que se asigna a los dispositivos físicos y que indica la resolución de la pantalla de estos. Se utilizará para indicar al usuario qué resolución de imagen debe asignar a cada dispositivo.

### Usuario

El usuario tiene acceso a un conjunto de dispositivos físicos determinado por el grupo de gestión al que pertenezca.

Las acciones que se pueden realizar desde una cuenta de usuario son:

* Configurar un dispositivo: El usuario puede dar un nombre y descripción a un dispositivo sin configurar así como asignarle imágenes o incluirlo en grupos.

* Añadir una imagen: El usuario puede subir una imagen al servidor para utilizarla en los dispositivos que haya configurado.

* Añadir un grupo: El usuario puede crear un grupo de dispositivos y asignar imágenes a dicho grupo.

### Evento

Para el caso de evento se permite la creación de este por parte de los dos tipos de usuario. En el caso de gestionar, eliminar o modificar, los administradores podrán hacerlo independientemente de si han creado o no es evento. Para los usuarios, solo podrán verse los que ellos mismos hayan creado.


### Imagen front

Para levantar la imagen realizaremos los siguientes pasos:
APi-Restful para la gestión del front-end y base de datos. Para construir la imagen de esta:

1. Situarse en la carpeta ---> cd iot-frontend
2. Construir la imagen en docker ---> docker build -t "iot-frontend:latest" .
