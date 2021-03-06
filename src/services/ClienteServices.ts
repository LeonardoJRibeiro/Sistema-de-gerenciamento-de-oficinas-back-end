import { FilterQuery } from 'mongoose';
import { ICliente } from "../models/Cliente";
import validacao from "../util/validacao";
import Cliente from "../models/Cliente";
import servicoValidacao from "./servicoValidacao";

interface ClienteQuery {
  nome?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
}

export default {
  validarClienteASerIncluido(informacoesDoCliente: ICliente) {
    const mensagens: string[] = [];
    !validacao.validarTexto(informacoesDoCliente.nome) && mensagens.push("Nome é obrigatório.");
    !validacao.validarData(informacoesDoCliente.dataNascimento) && mensagens.push("Data de nascimento é obrigatória.");
    !validacao.validarTexto(informacoesDoCliente.cpfCnpj) && mensagens.push("CPF/CNPJ é obrigatório.")
      || !validacao.validarCpfCnpj(informacoesDoCliente.cpfCnpj) && mensagens.push("CPF/CNPJ inválido");
    validacao.validarTexto(informacoesDoCliente.telefoneFixo) &&
      !validacao.validarTelefone(informacoesDoCliente.telefoneFixo) && mensagens.push("Telefone fixo inválido");
    !validacao.validarTexto(informacoesDoCliente.telefoneCelular) && mensagens.push("Telefone celular é obrigatório")
      || !validacao.validarTelefone(informacoesDoCliente.telefoneCelular) && mensagens.push("Telefone celular inválido.");
    validacao.validarTexto(informacoesDoCliente.email) &&
      !validacao.validarEmail(informacoesDoCliente.email) && mensagens.push("E-mail inválido.");
    mensagens.push(...servicoValidacao.validarEndereco(informacoesDoCliente.endereco));
    return mensagens;
  },

  validarClienteASerAlterado(informacoesDoCliente: ICliente) {
    const mensagens: string[] = [];
    !validacao.validarTexto(informacoesDoCliente.nome) && mensagens.push("Nome é obrigatório.");
    !validacao.validarData(informacoesDoCliente.dataNascimento) && mensagens.push("Data de nascimento é obrigatória.");
    validacao.validarTexto(informacoesDoCliente.telefoneFixo) &&
      !validacao.validarTelefone(informacoesDoCliente.telefoneFixo) && mensagens.push("Telefone fixo inválido");
    !validacao.validarTexto(informacoesDoCliente.telefoneCelular) && mensagens.push("Telefone celular é obrigatório")
      || !validacao.validarTelefone(informacoesDoCliente.telefoneCelular) && mensagens.push("Telefone celular inválido.");
    validacao.validarTexto(informacoesDoCliente.email) &&
      !validacao.validarEmail(informacoesDoCliente.email) && mensagens.push("E-mail inválido.");
    mensagens.push(...servicoValidacao.validarEndereco(informacoesDoCliente.endereco)); mensagens.push(...servicoValidacao.validarIdDoCliente(informacoesDoCliente._id));
    return mensagens;
  },

  async incluirCliente(informacoesDoCliente: ICliente) {
    return await Cliente
      .create(informacoesDoCliente);
  },

  async contarClientesPorCpfEIdOficina(informacoesDoCliente: ICliente) {
    return await Cliente
      .countDocuments({
        cpfCnpj: informacoesDoCliente.cpfCnpj,
        oficina: informacoesDoCliente.oficina,
      });
  },

  async listarPorOficina(oficina: string, pular: number, limite: number) {
    return await Cliente
      .find({
        oficina,

      })
      .select({
        //oficina:1
      })
      .skip(pular)
      .limit(limite);
  },

  async contarPorOficina(oficina: string) {
    return await Cliente
      .countDocuments({
        oficina
      });
  },

  async consultar(oficina: string, { nome, cpfCnpj, email, telefone }: ClienteQuery, pular: number, limite: number) {
    let match: FilterQuery<ICliente> = { oficina };
    nome && (match = {
      ...match,
      nome: {
        $regex: `^${nome}`,
        $options: "i",
      }
    });
    email && (match = {
      ...match,
      email: {
        $regex: `^${email}`,
        $options: "i",
      }
    });
    cpfCnpj && (match = {
      ...match,
      cpfCnpj: {
        $regex: `^${cpfCnpj}`,
        $options: "i",
      }
    });
    telefone && (match = {
      ...match,
      $or: [
        {
          telefoneCelular: {
            $regex: `^${telefone}`,
            $options: "i",
          }
        },
        {
          telefoneFixo: {
            $regex: `^${telefone}`,
            $options: "i",
          }
        },
      ]
    });
    return await Cliente
      .find(match)
      .skip(pular)
      .limit(limite);
  },

  async contarPorConsulta(oficina: string, { nome, cpfCnpj, email, telefone }: ClienteQuery) {
    let match: FilterQuery<ICliente> = { oficina };
    nome && (match = {
      ...match,
      nome: {
        $regex: `^${nome}`,
        $options: "i",
      }
    });
    email && (match = {
      ...match,
      email: {
        $regex: `^${email}`,
        $options: "i",
      }
    });
    cpfCnpj && (match = {
      ...match,
      cpfCnpj: {
        $regex: `^${cpfCnpj}`,
        $options: "i",
      }
    });
    telefone && (match = {
      ...match,
      $or: [
        {
          telefoneCelular: {
            $regex: `^${telefone}`,
            $options: "i",
          }
        },
        {
          telefoneFixo: {
            $regex: `^${telefone}`,
            $options: "i",
          }
        },
      ]
    });
    return await Cliente
      .countDocuments(match);
  },

  async listarPorIdClienteEIdOficina(oficina: string, _id: string) {
    return await Cliente
      .findOne({
        oficina,
        _id,
      })
      .select({
        oficina: 0,
        __v: 0,

      });
  },

  async alterarCliente(informacoesDoCliente: ICliente) {
    return await Cliente
      .updateOne(
        {
          _id: informacoesDoCliente._id
        },
        {
          $set: informacoesDoCliente,
        },
      );
  },
}