Crea una web app frontend utilizando react con typescript utilizando la api @mock-api.

La idea de la app es que sea una billetera virtual donde lo importante son los datos de dinero (como montos, monedas y estados de una operación), teniendo en cuenta los posibles errores, validaciones, seguridad en general, experiencia de usuario y testeo.

La app va a tener un sistema de logueo, donde se va validar el email y contraseña (tiene que estar conectado con la api), este debe tener una opción de olvide mi usuario y otra de olvide mi contraseña y tambien una sección de registro donde el usuario va a poder crear un usuario si es que este no tiene uno (debe tener una validación pero no estaría conectado a una api, es solo de ejemplo)

Es importante que una vez el usuario se logue se guarden los datos del mismo en el localstorage para que se puedan utilizar los mismos el los endpoints que se utilizen en el futuro

Las secciones de la app van a ser las siguientes:

- La sección principal llamada "billetera personal" donde se va a poder ver el saldo del usuario (saldo en pesos y el dólares), ultimas transacciones
- "Historial" donde el usuario va a poder ver el historial de sus gastos
- "Cuenta" donde el usuario pueda ver sus datos personales (los que estan guardados en el localstorage)
- "Transferir" donde el usuario va poder ver todos los usuarios asociados y transferirles plata una vez lo seleccione