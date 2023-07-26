function encontraValor(json, valores) {
  let res = {};
  for (var chave in valores) {
    var caminho = valores[chave];
    var valorEncontrado = percorreJSON(json, caminho);
    res[chave] = valorEncontrado;
  }
  return res;
}

function percorreJSON(json, caminho) {
  var valorAtual = json;
  for (var i = 0; i < caminho.length; i++) {
    var chave = caminho[i];
    if (valorAtual[chave] !== undefined) {
      valorAtual = valorAtual[chave];
    } else {
      return null;
    }
  }
  return valorAtual;
}

function criaMensagem(valores) {
  let message = "";
  var qtdFilhos = valores.bebes + valores.criancas;
  var qtdPessoas = valores.adultos + valores.bebes + valores.criancas;

  for (var chave in valores) {
    if (valores[chave] === null) {
      //   valores.msg = "Houve um erro, por favor tente novamente.";
      return false;
    }
  }

  message = `Olá, gostaria de sua ajuda no planejamento de um roteiro para uma viagem que irei realizar. ${
    qtdPessoas === 1
      ? `Será apenas eu,`
      : `Somos em ${qtdPessoas}, ${
          valores.qtdFilhos
            ? `uma família com ${qtdFilhos} filhos, ${
                valores.bebes > 0
                  ? `sendo ${valores.bebes} bebês`
                  : "com nenhum bebê"
              }`
            : "todos adultos,"
        }`
  } e estamos indo para ${valores.cidadeChegada}, saindo de ${
    valores.cidadePartida
  }. ${qtdPessoas > 1 ? "Chegaremos" : "Chegarei"} na data ${
    valores.dataChegada
  } e voltaremos na data ${valores.dataVolta}.`;

  return message;
}

const generateNewBody = (body) => {
  let newbdy = `Lembre-se que `;
  if (body.Hotels && body.Hotels.length) {
    newbdy =
      newbdy +
      body.Hotels.map(
        (hotel) =>
          `estarei hospedado em ${hotel.HotelName} em ${hotel.city},${hotel.state} do dia ${hotel.checkin} ate ${hotel.checkout}`
      ).join(",") +
      ". ";
  }
  if (body.Services && body.Services.length) {
    newbdy =
      newbdy +
      "Farei passeios " +
      body.Services.map(
        (servico) =>
          `na atracao "${servico.name}" nos dia ${servico.date} localizada em ${servico.city},${servico.state}`
      ).join(",") +
      ". ";
  }
  return newbdy;
};

const generatePromptJson = (body) => {
  try {
    let parsed = encontraValor(body, JSON_VALUE2);
    let newbody = generateNewBody(body);
    let message = criaMensagem(parsed);
    let msg = `${message}, gostaria de detalhes do que fazer no local e descrição amigável sobre as informações 
  traga detalhes de um eventual roteiro da viagem com ideias novas do que fazer trazendo detalhes e nomes dos restaurantes ou atrações do que fazer.\n
  ${newbody} ${
      body.flight
        ? `Minhas Informacoes de Voo sao ${JSON.stringify(body.flight)}`
        : ""
    }
  Poderia criar um roteiro 
  para que eu aproveite o máximo minha viagem? Personifique um agente da CVC na hora de dar a resposta.
  Não mencione que os dados estão vindo do json`;

    return msg;
  } catch (e) {
    return false;
  }
};

var JSON_VALUE2 = {
  cidadePartida: ["departure"],
  cidadeChegada: ["arrival"],
  adultos: ["paxGroup", "adult"],
  bebes: ["paxGroup", "babies"],
  criancas: ["paxGroup", "children"],
  dataChegada: ["startDate"],
  dataVolta: ["endDate"],
};

module.exports = {
  generatePromptJson,
};

// console.log(generatePrompt(json));
