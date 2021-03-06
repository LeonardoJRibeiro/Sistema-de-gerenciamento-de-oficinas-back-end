import modeloServices from '../services/ModeloServices';
import servicoValidacao from '../services/servicoValidacao';
import { Request, Response } from 'express';
import { IModelo } from '../models/Modelo';
import { Types } from 'mongoose';
import { sendMessageTo } from '../Socket';

export default {
  async incluirModelo(requisicao: Request, resposta: Response) {
    const oficina = requisicao.body.oficina as string;
    const descricao = requisicao.body.descricao as string;
    const marca = requisicao.body.marca as string;
    try {
      const modeloASerInserido = {
        descricao,
        marca,
        oficina,
      } as IModelo;
      const mensagens = modeloServices.validarModeloASerIncluido(modeloASerInserido);
      if (mensagens.length) {
        return resposta
          .status(406)
          .json({
            mensagem: mensagens
          });
      }
      const modeloExistenteNaOficina = await modeloServices.contarPorDescricaoDoModeloEIdOficina(modeloASerInserido);
      if (modeloExistenteNaOficina) {
        return resposta
          .status(406)
          .json({
            mensagem: "Esse modelo já está cadastrado"
          });
      }
      const modeloInserido = await modeloServices.incluirModelo(modeloASerInserido);
      if (!modeloInserido) {
        return resposta
          .status(500)
          .json({
            mensagem: "Modelo não cadastrado."
          });
      }
      sendMessageTo(oficina, 'modeloIncluido', modeloInserido);
      return resposta
        .status(201)
        .json({
          mensagem: "Modelo cadastrado com sucesso."
        });
    }
    catch (erro) {
      console.log(erro);
      return resposta.status(400).send();
    }
  },

  async listarTodos(requisicao: Request, resposta: Response) {
    const oficina = requisicao.body.oficina as string;
    const pular = Number(requisicao.query.pular)
    const limite = Number(requisicao.query.limite);
    try {
      const modelos = await modeloServices.listarPorOficina(oficina, pular, limite);
      const total = await modeloServices.contarPorOficina(oficina);
      return resposta.json({
        itens: modelos,
        total
      });
    }
    catch (erro) {
      console.log(erro);
      return resposta.status(400).send();
    }
  },

  async listarModeloPorId(requisicao: Request, resposta: Response) {
    const oficina = requisicao.body.oficina as string;
    const _id = requisicao.query._id as string;
    try {
      const mensagens = servicoValidacao.validarIdDoModelo(_id);
      if (mensagens.length) {
        return resposta
          .status(406)
          .json({
            mensagem: mensagens
          });
      }
      const modeloListado = await modeloServices.listarPorIdModeloEIdOficina(oficina, _id);
      if (!modeloListado) {
        return resposta
          .status(500)
          .json({
            mensagem: "Erro ao listar modelo."
          });
      }
      return resposta.json(modeloListado);
    }
    catch (erro) {
      console.log(erro);
      return resposta.status(400).send();
    }
  },

  async consultarModelos(requisicao: Request, resposta: Response) {
    const oficina = requisicao.body.oficina as string;
    const descricao = requisicao.query.descricao as string;
    const marca = requisicao.query.marca as string;
    const pular = Number(requisicao.query.pular)
    const limite = Number(requisicao.query.limite);
    try {
      if ((marca && !Types.ObjectId.isValid(marca))) {
        return resposta.status(400).send();
      }
      const modelos = await modeloServices.consultar(oficina, descricao, marca, pular, limite);
      const total = await modeloServices.contarPorConsulta(oficina, descricao, marca,);
      if (!modelos) {
        return resposta
          .status(500)
          .json({
            mensagem: "Erro ao listar modelos."
          });
      }
      return resposta.json({
        itens: modelos,
        total,
      });
    }
    catch (erro) {
      console.log(erro);
      return resposta.status(400).send();
    }
  },

  async alterarModelo(requisicao: Request, resposta: Response) {
    const _id = requisicao.body._id as string;
    const descricao = requisicao.body.descricao as string;
    const marca = requisicao.body.marca as string;
    try {
      const modeloASerAlterado = {
        _id,
        descricao,
        marca,
      } as IModelo;
      const mensagens = modeloServices.validarModeloASerAlterado(modeloASerAlterado);
      if (mensagens.length) {
        return resposta
          .status(406)
          .json({
            mensagem: mensagens
          });
      }
      const resultado = await modeloServices.alterarModelo(modeloASerAlterado);
      if (!resultado) {
        return resposta
          .status(500)
          .json({
            mensagem: "Modelo não alterado."
          });
      }
      return resposta.status(201).json({ mensagem: "Modelo alterado com sucesso." });
    }
    catch (erro) {
      console.log(erro);
      return resposta.status(400).send();
    }
  },
}