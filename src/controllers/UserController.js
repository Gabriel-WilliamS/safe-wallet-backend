const database = require('../database/connection');
const bcrypt = require('bcrypt')
class UserController {

    // Criando um novo usuário 
    async newUser(req, res) {
        // Requisitos para a criação de um usuário
        const { user_name, user_password, user_email } = req.body;
        // Verificação de usuário já existente!
        const query = await database('users').where({ user_email }).limit(1)
        const result = await query

        if (result.length > 0) {
            return res.json({ error: 'Usuário já cadastrado.' })
        } else {
            // Criptografando a senha com bcrypt
            const hashedPassword = await bcrypt.hash(user_password, 10)
            // Inserindo os dados no banco de dados
            database.insert({ user_name, user_password: hashedPassword, user_email }).table("users").then(data => {
                res.json({ sucesso: "Usuario criado com sucesso!" });
            }).catch(error => {
                console.log(error);
            })
        }
    }
    // Login de usuário
    async login(req, res) {
        try {
            // Requisitos para o login do usuário
            const { user_email, user_password } = req.body
            // Vereficação dos campos
            if (!user_email || user_email === null || user_email === undefined || user_email === '') {
                return res.json({ error: "Email está indefinido ou é inválido." })
            } else if (!user_password || user_password === null || user_password === undefined || user_password === '') {
                return res.json({ error: "Password está indefinida ou é inválida." })
            } else {
                // Validando os dados Enviados
                const query = await database.select("*").table("users").where({ user_email }).limit(1)
                const pass = query[0].user_password
                if (await bcrypt.compare(user_password, pass)) {

                    return res.json({ sucess: "Usuário encontrado!", ...query[0] })
                }
                return res.json({ error: "Senha Inválida!" })
            }
        } catch (error) {
            return res.json({ error: "Usuário ou Senha inválido!" })
        }
    }

    // Alteração dos dodos do usuário
    async UpdateUser(req, res) {
        try {
            // Requisitos para o Update do usuário
            const { user_name, user_password, user_id } = req.body;
            // Verificação dos campos
            if (!user_id || user_id === '' || user_id === null || user_id === undefined || typeof user_id !== 'number') {
                return res.json({ error: 'user_id da carteira não esta definido ou é inválido e precisa ser um numero.' })
            } else if (!user_name || user_name === '' || user_name === null || user_name === undefined) {
                return res.json({ error: 'user_name da carteira não esta definido ou é inválido.' })
            } else if (!user_password || user_password === '' || user_password === null || user_password === undefined) {
                return res.json({ error: 'user_password não está definido ou é inválido.' })
            } else {
                const user = await database('users').where({ user_id }).limit(1)
                const result = await user
                const pass = result[0].user_password
                // Comparando a senha criptografada com a senha enviada
                if (user_name === result[0].user_name && await bcrypt.compare(user_password, pass)) {
                    return res.json({ error: 'Não ouve nenhuma alteração.' })
                } else {
                    // Guardando os novos dados enviados
                    const hashedPassword = await bcrypt.hash(user_password, 10)
                    await database('users')
                        .where({ user_id })
                        .update({
                            user_name,
                            user_password: hashedPassword
                        })
                    const query = await database('users').where({ user_id }).limit(1)
                    const resultUser = await query

                    return res.json({ sucesso: 'Usuário atualizado.', ...resultUser[0] })
                }
            }
        } catch (error) {
            console.log(error.message)
            return res.json({ error: error.message })
        }
    }

    async getInfos(req, res, next){
        try{
          const {user_id} = req.body

          const userInfos = await database('users')
                                    .where({user_id})

          const resultUser = await userInfos
          const despesa = await database('registers')
                                    .sum('register_value')
                                    .where({user_id,register_is_revenue:false})
          const resultDespesa = await despesa
  
          const receita = await database('registers')
                                    .sum('register_value')
                                    .where({user_id,register_is_revenue:true})
          const resultReceita = await receita
          
          const wallet = await database('wallet')
                                    .sum('wallet_value')
                                    .where({user_id})
          const resultWallet = await wallet
  
          const registers = await database('registers')
                                      .where({user_id})
                                      .orderBy('register_id','desc')
                                      .limit(3)
          const resultRegisters = await registers
  
          const infosUser ={
            userInfos: 
                 resultUser[0],
            baseInfos: {
              despesa: resultDespesa[0]['sum(`register_value`)'],
              receita: resultReceita[0]['sum(`register_value`)'], 
              wallet: resultWallet[0]['sum(`wallet_value`)']
            },
            registers: resultRegisters
          }
  
          return res.json(infosUser)
  
        }catch(error){
          next(error.message)
        }
      }
}

module.exports = new UserController();