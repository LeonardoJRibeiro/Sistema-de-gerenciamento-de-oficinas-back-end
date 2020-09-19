import { IServico } from "../models/Servico";

import validacao from "../util/validacao";
import Servico from "../models/Servico";
import servicoValidacao from "./servicoValidacao";

export default class ServicoServices {
  validarServico(informacoesDoServico: IServico) {
    const mensagens : string[] = [];
    !validacao.validarTexto(informacoesDoServico.descricao) && mensagens.push('Descricao é obrigatório.');
    !validacao.validarNumero(informacoesDoServico.tempoDuracao) && mensagens.push('Tempo de duração é obrigatório');
    !validacao.validarNumero(informacoesDoServico.valor) && mensagens.push("Valor é obrigatório.");
    return mensagens;
  }

  validarServicoASerAlterado(informacoesDoServico: IServico) {
    const mensagens: string[] = [];
    !validacao.validarTexto(informacoesDoServico.descricao) && mensagens.push('Descricao é obrigatório.');
    !validacao.validarNumero(informacoesDoServico.tempoDuracao) && mensagens.push('Tempo de duração é obrigatório');
    !validacao.validarNumero(informacoesDoServico.valor) && mensagens.push("Valor é obrigatório.");
    mensagens.push(...servicoValidacao.validarIdDoServico(informacoesDoServico._id));
    return mensagens;
  }

  async contarServicosPorDescricaoEIdOficina(informacoesDoServico: IServico) {
    return await Servico
      .countDocuments({
        oficina: informacoesDoServico.oficina,
        descricao: informacoesDoServico.descricao,
      })
  }

  async inserirServico(informacoesDoServico: IServico) {
    return await Servico
      .create(informacoesDoServico)
  }

  async listarPorOficina(oficina: string, pular: number, limite: number) {
    return await Servico
      .find({
        oficina: oficina,
      })
      .skip(pular)
      .limit(limite);
  }

  async contarPorOficina(oficina: string ) {
    return await Servico
      .countDocuments({
        oficina: oficina,
      });
  }

  async listarPorIdServicoEIdOficina(informacoesDoFuncionario: IServico) {
    return await Servico
      .findOne({
        _id: informacoesDoFuncionario._id,
        oficina: informacoesDoFuncionario.oficina,
      })
  }

  async alterarServico(informacoesDoServico: IServico) {
    return await Servico
      .updateOne(
        {
          _id: informacoesDoServico._id,
        },
        {
          $set: informacoesDoServico
        }
      )
  }
}