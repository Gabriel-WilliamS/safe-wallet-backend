const database = require('../database/connection');

class RegisterController {

    async CreateRegister(req, res, next){
      try{
        let {
          user_id,
          wallet_id,
          register_name, 
          register_value, 
          register_category,
          register_date
        } = req.body;
        let { register_is_revenue } = req.body

        if(!user_id || user_id === '' || user_id === null || user_id === undefined || typeof user_id !== 'number'){
          return res.json({erro: 'user_id não está definido ou é inválido e precisa der um numero.'})
        }else if(!wallet_id || wallet_id === '' || wallet_id === null || wallet_id === undefined || typeof wallet_id !== 'number'){
          return res.json({erro: 'wallet_id não está definido ou é inválido e precisa der um numero.'})
        }else if(!register_name || register_name === '' || register_name === null || register_name === undefined){
          return res.json({erro: 'register_name não está definido ou é inválido.'})
        }else if(!register_value || register_value === '' || register_value === null || register_value === undefined || typeof register_value !== 'number'){
          return res.json({erro: 'register_value não está definido ou é inválido e precisa der um numero.'})
        }else if(!register_category || register_category === '' || register_category === null || register_category === undefined){
          return res.json({erro: 'register_category não está definido ou é inválido.'})
        }else if(!register_date || register_date === '' || register_date === null || register_date === undefined){
          return res.json({erro: 'register_date não está definido ou é inválido.'})
        }else if(typeof register_is_revenue !== 'boolean'){
          return res.json({erro: 'register_is_revenue não está definido ou é inválido e precisa ser um boolean.'})
        }else{
         
          const queryWallet =  await database('wallet').where({user_id,wallet_id})
          const resultWallet = await queryWallet[0]
          
          if(!register_is_revenue && resultWallet.wallet_value < register_value ){
            return res.json({error: 'Saldo insuficiente na carteira atual, escolha outra carteira.'})
          }else if(!register_is_revenue) {
            await database('wallet').update({wallet_value: resultWallet.wallet_value-register_value}).where({user_id,wallet_id})
          }else{
            await database('wallet').update({wallet_value: resultWallet.wallet_value+register_value}).where({user_id,wallet_id})
          }
          
          await database('registers')
                .insert({
                  user_id,
                  wallet_id,
                  register_name, 
                  register_value, 
                  register_category,
                  register_date,
                  register_is_revenue 
                })
          const query = await database('registers').where({user_id,wallet_id})
          const result = await query
          return res.json({sucesso: 'Receita criada.', registers: result})
        }
      }catch(error){
        next(error.message)
      }
    }

    async GetAllRegisters(req, res, next) {
      try {
        const {user_id} = req.body
        if(!user_id){
          return res.json({erro: 'user_id não está definido.'})
        }else{
          const registers = await database('registers').where({user_id}).orderBy('register_id','desc')
          const resultRegisters = await registers
  
          return res.json(resultRegisters)
        }
      } catch (error) {
        next(error.message)
      }
    }

    async updateRegister(req, res, next) {
      try {
        const {user_id,register_id,wallet_id,register_name,register_value,register_category,register_date,register_is_revenue} = req.body

        if(!user_id || user_id === '' || user_id === null || user_id === undefined || typeof user_id !== 'number'){
          return res.json({erro: 'user_id não está definido ou é inválido e precisa der um numero.'})
        }else if(!wallet_id || wallet_id === '' || wallet_id === null || wallet_id === undefined || typeof wallet_id !== 'number'){
          return res.json({erro: 'wallet_id não está definido ou é inválido e precisa der um numero.'})
        }else if(!register_name || register_name === '' || register_name === null || register_name === undefined){
          return res.json({erro: 'register_name não está definido ou é inválido.'})
        }else if(!register_value || register_value === '' || register_value === null || register_value === undefined || typeof register_value !== 'number'){
          return res.json({erro: 'register_value não está definido ou é inválido e precisa der um numero.'})
        }else if(!register_category || register_category === '' || register_category === null || register_category === undefined){
          return res.json({erro: 'register_category não está definido ou é inválido.'})
        }else if(!register_date || register_date === '' || register_date === null || register_date === undefined){
          return res.json({erro: 'register_date não está definido ou é inválido.'})
        }else if(typeof register_is_revenue !== 'boolean'){
          return res.json({erro: 'register_is_revenue não está definido ou é inválido e precisa ser um boolean.'})
        }else{

          const queryWallet =  await database('wallet').where({wallet_id})
          const walletValue = await queryWallet[0].wallet_value

          const queryRegister = await database('registers').where({user_id,register_id})
          const resultRegisterValue = queryRegister[0].register_value

       

          if(register_value > resultRegisterValue && !register_is_revenue){
            const newValue = resultRegisterValue - register_value
            await database('wallet').update({wallet_value:walletValue + newValue}).where({user_id,wallet_id})
          }else{
            const newValue = resultRegisterValue - register_value
            await database('wallet').update({wallet_value:walletValue - newValue}).where({user_id,wallet_id})
          }

          await database('registers')
          .where({ user_id,register_id})
          .update({
              register_name,
              register_value,
              register_category,
              register_date,
              register_is_revenue,
              wallet_id
          })
          const query = await database('registers').where({ user_id,register_id }).limit(1)
          const resultRegister = await query

          return res.json({ sucesso: 'Registro atualizado.', ...resultRegister[0] })
        }
        
      } catch (error) {
        next(error.message)
      }
    }

}

module.exports = new RegisterController();