import React from 'react'
import { motion } from 'framer-motion'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/redux/authSlice'
import { selectError, selectLoading } from '../store/redux/store'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const error = useSelector(selectError)
  const loading = useSelector(selectLoading)
  const [email, setEmail] = React.useState('admin@example.com')
  const [password, setPassword] = React.useState('password')

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const result = await dispatch(login({ email, password }))
      if (result.meta.requestStatus === 'fulfilled') {
        // Soft navigate to keep Redux state and avoid losing session on reload
        navigate('/', { replace: true })
      }
    } catch {}
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-400 via-primary-600 to-primary-800">
      {/* Animated background blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          borderRadius: ["30%", "50%", "30%"]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-96 h-96 bg-primary-300/30 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
          borderRadius: ["50%", "30%", "50%"]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"
      />
      
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glass card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
            {/* Logo/Title */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Espace Compta</h1>
              <p className="text-white/80 text-sm">Bienvenue! Connectez-vous pour continuer</p>
            </motion.div>

            <form onSubmit={onSubmit} className="space-y-5">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Input 
                  label={<span className="text-white font-medium">Email</span>}
                  type="email"
                  placeholder="votre@email.com" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  className="backdrop-blur-sm"
                />
              </motion.div>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Input 
                  label={<span className="text-white font-medium">Mot de passe</span>}
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  className="backdrop-blur-sm"
                />
              </motion.div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {typeof error === 'string' ? error : 'Une erreur est survenue'}
                  </span>
                </motion.div>
              )}
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <Button 
                  type="submit"
                  disabled={loading} 
                  className="w-full !from-primary-600 !to-primary-700 !bg-primary-600 !text-white hover:!from-white hover:!to-white hover:!bg-white hover:!text-primary-700 !shadow-xl hover:!shadow-2xl hover:!scale-105 !font-bold !py-4 !text-lg !border-2 !border-white/20 hover:!border-primary-600 !text-center !justify-center transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 w-full">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    <span className="w-full text-center">Se connecter</span>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-white/60 text-xs"
            >
              Demo: admin@example.com / password
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
