// src/pages/Profile.js
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.15, when: 'beforeChildren' }
  }
};
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Profile() {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const [name, setName] = useState(user.name);

  const handleSave = async e => {
    e.preventDefault();
    await updateProfile(name);
  };

  return (
    <motion.div
      className="min-h-screen bg-offwhite flex items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6"
        variants={itemVariants}
      >
        <motion.h2
          className="text-2xl font-heading text-primary mb-4 text-center"
          variants={itemVariants}
        >
          Your Profile
        </motion.h2>

        <motion.div className="mb-6" variants={itemVariants}>
          <label className="block text-text font-medium mb-1">Email</label>
          <p className="text-gray-700">{user.email}</p>
        </motion.div>

        <motion.form onSubmit={handleSave} variants={itemVariants}>
          <label className="block text-text font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="
              w-full
              border border-gray-300
              rounded-lg
              px-4 py-2
              mb-4
              focus:outline-none
              focus:ring-2 focus:ring-primary/50
              transition
            "
          />
          <button
            type="submit"
            className="
              w-full
              bg-secondary
              text-white
              font-medium
              px-4 py-2
              rounded-lg
              hover:bg-secondary-dark
              active:scale-95
              transition
            "
          >
            Save
          </button>
        </motion.form>

        <motion.div
          className="mt-6 text-center"
          variants={itemVariants}
        >
          <button
            onClick={logout}
            className="
              text-red-600
              hover:underline
              font-medium
            "
          >
            Log Out
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
