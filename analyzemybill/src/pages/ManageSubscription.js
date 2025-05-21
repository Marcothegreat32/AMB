export default function ManageSubscription() {
  const [loading, setLoading] = useState(false);

  const goToPortal = async () => {
    setLoading(true);
    const { data } = await axios.post('/api/create-portal-session');
    window.location.href = data.url;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading mb-4">Manage Your Subscription</h2>
      <button
        onClick={goToPortal}
        disabled={loading}
        className="bg-primary text-white px-6 py-2 rounded-full"
      >
        {loading ? 'Redirecting…' : 'Open Billing Portal'}
      </button>
    </div>
  );
}
