const database = require('../database/connection');

class WalletController {
  async CreateWallet(req, res, next){
    try{
      const {user_id, wallet_name, wallet_value} = req.body
      const query = await database('wallet').where({user_id, wallet_name}).limit(1)
      const result = await query
      
      if(result.length  > 0){
        return res.json({erro: 'Carteira rexistente.'})
      }else{
        if(!user_id || user_id === '' || user_id === null || user_id === undefined || typeof user_id !== 'number'){
          return res.json({error: 'user_id não está definido ou é inválido e precisa ser um numero.'})
        }else if(!wallet_name || wallet_name === '' || wallet_name === null || wallet_name === undefined){
          return res.json({error: 'wallet_name precisa ser informado.'})
        }else if(!wallet_value || wallet_value === '' || wallet_value === null || wallet_value === undefined || typeof wallet_value !== 'number'){
          return res.json({error: 'wallet_value precisa ser informado e precisa ser um numero.'})
        }else{
          try{
            await database('wallet')
                    .insert({
                      user_id,
                      wallet_name,
                      wallet_value
                    })
          }catch(error){
            next(error.message)
          }
          const query = await database('wallet').where({user_id, wallet_name}).limit(1)
          const wallet = await query
  
          return res.json({sucesso: 'Carteira criada', ...wallet[0]})
        }
      }
    }catch(error){
      next(error.message)
    }
  }

  async UpdateWallet(req, res, next){
    try{
      const {user_id, wallet_id, wallet_value, wallet_name} = req.body

      if(!wallet_id || wallet_id === '' || wallet_id === null || wallet_id === undefined || typeof wallet_id !== 'number'){
        return res.json({error: 'wallet_id da carteira não esta definido ou é inválido e precisa ser um numero.'})
      }else if(!user_id || user_id === '' || user_id === null || user_id === undefined || typeof user_id !== 'number'){
        return res.json({error: 'user_id não está definido ou é inválido e precisa ser um numero.'})
      }else if(!wallet_name || wallet_name === '' || wallet_name === null || wallet_name === undefined){
        return res.json({error: 'wallet_name precisa ser informado.'})
      }else if(!wallet_value || wallet_value === '' || wallet_value === null || wallet_value === undefined || typeof wallet_value !== 'number'){
        return res.json({error: 'wallet_value precisa ser informado e precisa ser um numero.'})
      }else{
        const wallet = await database('wallet').where({wallet_id})
        const result = await wallet[0]

        if(wallet_name === result.wallet_name && wallet_value === result.wallet_value){
          return res.json({error: 'Não ouve alterações.'})
        }else{
          const allwallets = await database('wallet').where({wallet_name})
          const resultAllWallet = await allwallets
          
            await database('wallet')
                    .where({user_id, wallet_id})
                    .update({
                      wallet_name,
                      wallet_value
                    })
            const query = await database('wallet').where({user_id, wallet_id}).limit(1)
            const wallet = await query
    
            return res.json({sucesso: 'Carteira atualizada.', ...wallet[0]})
        }
      }
    }catch(error){
      next(error.message)
    }
  }

  async getWallets(req,res,next){
    try {
      const {user_id} = req.body
        if(!user_id){
          return res.json({erro: 'user_id não está definido.'})
        }else{
          const query = await database('wallet').where({user_id})
          const result = await query[0]
  
          return res.json(result)
        }
    } catch (error) {
      next(error.message)
    }
  }

  async deleteWallet(req,res,next){
    try {
     const {user_id, wallet_id} = req.body

     const query = await database('wallet').where({user_id})
     const result = await query

      if(!user_id){
        return res.json({erro: 'user_id não está definido.'})
      }else if(result.length <= 1){
        return res.json({error: "Não pode excluir sua ultima carteira existente"})
      }else{
        await database('wallet').where({user_id,wallet_id}).delete()
        return res.json({sucess: "Carteira "+wallet_id+" excluida"})
      }

    } catch (error) {
      next(error.message)
    }
  }
}

module.exports = new WalletController();