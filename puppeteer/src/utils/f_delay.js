//desc: equivalente a sleep
//params: (number) quantidade de milisegundos que ficara esperando
//return: nenhum
module.exports = {
    delay(time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time)
        });
    }
}
