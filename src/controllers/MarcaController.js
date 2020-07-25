const marcaServices = require('../services/marcaServices');

module.exports = {

  async incluirDadosDaMarca(requisicao, resposta) {
    const { descricao, idOficina } = requisicao.body;
    const marcaASerInserida = {
      descricao,
      idOficina,
    }
    const mensagens = marcaServices.validarMarcaASerInserida(marcaASerInserida);
    if (mensagens.length) {
      return resposta
        .status(406)
        .json({
          mensagem: mensagens
        });
    }
    const marcaExistenteNaOficina = await marcaServices.contarPorDescricaoEIdOficina(marcaASerInserida);
    if (marcaExistenteNaOficina) {
      return resposta
        .status(406)
        .json({
          mensagem: "Essa marca já está cadastrada"
        });
    }
    let uriLogo = null;
    if (requisicao.file) {
      uriLogo = await marcaServices.fazerUploadDaLogomarca(requisicao.file)
      if (!uriLogo) {
        return resposta
          .status(500)
          .json({
            mensagem: "Marca não cadastrada."
          });
      }
    }
    marcaASerInserida.uriLogo = uriLogo;
    const marcaInserida = await marcaServices.inserir(marcaASerInserida);
    if (!marcaInserida) {
      return resposta
        .status(500)
        .json({
          mensagem: "Marca não cadastrada."
        });
    }
    return resposta
      .status(201)
      .json({
        mensagem: "Marca cadastrada com sucesso."
      });
  },

  async listarTodos(requisicao, resposta) {
    const { idOficina } = requisicao.query;
    const mensagens = marcaServices.validarIdDaOficina({ idOficina });
    if (mensagens.length) {
      return resposta
        .status(406)
        .json({
          mensagem: mensagens
        });
    }
    const marcas = await marcaServices.listarPorIdOficina(idOficina);
    return resposta
      .json(marcas);
  },

  async listarMarcaPorId(req, resposta) {
    const { idOficina, _id } = req.query;
    const informacoesDaMarca = {
      _id,
      idOficina,
    }
    const mensagens = marcaServices.validarIdDaOficinaEIdDaMarca(informacoesDaMarca);
    if (mensagens.length) {
      return resposta
        .status(406)
        .json({
          mensagem: mensagens
        });
    }
    const marcaListada = await marcaServices.listarPorIdMarcaEIdOficina(informacoesDaMarca);
    if (!marcaListada) {
      return resposta
        .status(500)
        .json({
          mensagem: "Erro ao listar marca."
        });
    }
    return resposta.json(marcaListada);
  },

  async listarPorDescricaoParcialEIdOficina(requisicao, resposta) {
    const { idOficina, descricao } = requisicao.query;
    const informacoesDaMarca = {
      descricao,
      idOficina,
    }
    const mensagens = marcaServices.validarIdDaOficina(informacoesDaMarca);
    if (mensagens.length) {
      return resposta
        .status(406)
        .json({
          mensagem: mensagens
        });
    }
    const marca = await marcaServices.listarPorDescricaoParcialEIdOficina(informacoesDaMarca);
    return resposta
      .json(marca);
  },

  async alterarMarca(requisicao, resposta) {
    const { _id, descricao, idOficina, uriLogo, } = requisicao.body;
    const marcaASerAleterada = {
      _id,
      descricao,
      idOficina,
    }
    const mensagens = marcaServices.validarMarcaASerAlterada(marcaASerAleterada);
    if (mensagens.length) {
      return resposta
        .status(406)
        .json({
          mensagem: mensagens
        });
    }
    let uriLogoNova = null;
    if (requisicao.file) {
      uriLogoNova = await marcaServices.fazerUploadDaLogomarca(requisicao.file)
      if (!uriLogoNova) {
        return resposta
          .status(500)
          .json({
            mensagem: "Marca não alterada."
          });
      }
    }
    marcaASerAleterada.uriLogo = uriLogoNova;
    const resultado = await marcaServices.alterarMarca(marcaASerAleterada);
    if (!resultado) {
      return resposta
        .status(500)
        .json({
          mensagem: "Marca não editada."
        });
    }
    await marcaServices.apagarLogomarca(uriLogo);
    return resposta
      .status(201)
      .json({
        mensagem: "Marca alterada com sucesso."
      });
  },
}
