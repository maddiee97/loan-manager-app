// client/src/pages/Dashboard.jsx (THE ONE, FINAL, COMPLETE CODE)
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.jsx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { Calendar } from "@/components/ui/calendar.jsx";
import { PlusCircle, DollarSign, Percent, Banknote, Activity, CheckCircle2, Circle, Trash2, Edit } from 'lucide-react';
import { Progress } from "@/components/ui/progress";



const StatCard = ({ title, value, icon, color, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${color}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);


const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1); // <-- ADD THIS LINE
  const loansPerPage = 10;
  const [borrowerPage, setBorrowerPage] = useState(1);
  const borrowersPerPage = 12;

  const [stats, setStats] = useState({ totalPrincipal: 0, totalInterest: 0, totalCollectibles: 0, activeLoans: 0, overdueLoans: 0 });
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
  const [isAddBorrowerOpen, setIsAddBorrowerOpen] = useState(false);
  const [isViewPaymentsOpen, setIsViewPaymentsOpen] = useState(false);
  const [isDeleteLoanOpen, setIsDeleteLoanOpen] = useState(false);
  const [isDeleteBorrowerOpen, setIsDeleteBorrowerOpen] = useState(false);
  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedLoanPayments, setSelectedLoanPayments] = useState([]);
  
  
  const [newLoan, setNewLoan] = useState({ borrowerId: '', loanSubject: '', principalAmount: '', interestRate: '', loanTerm: '', paymentSchedule: 'Monthly', issueDate: new Date() });
  const [editLoanData, setEditLoanData] = useState({ id: null, loanSubject: '' });
  const [newPayment, setNewPayment] = useState({ amount: '', installment: null });
  const [newBorrower, setNewBorrower] = useState({ name: '', contactInfo: '' });
  const [isEditBorrowerOpen, setIsEditBorrowerOpen] = useState(false);
const [editBorrowerData, setEditBorrowerData] = useState(null);


  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/auth'; return; }
    const config = { headers: { 'x-auth-token': token } };
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/loans/update-statuses`, null, config);
      const [statsRes, borrowersRes, loansRes] = await Promise.all([
  axios.get(`${import.meta.env.VITE_API_URL}/api/stats`, config),
  axios.get(`${import.meta.env.VITE_API_URL}/api/borrowers`, config),
  axios.get(`${import.meta.env.VITE_API_URL}/api/loans`, config)
]);
      setStats(statsRes.data);
      setBorrowers(borrowersRes.data);
      setLoans(loansRes.data);
    } catch (err) { console.error('Error fetching data:', err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  
  const handleAddLoan = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/loans', { ...newLoan, principalAmount: parseFloat(newLoan.principalAmount), interestRate: parseFloat(newLoan.interestRate), loanTerm: parseInt(newLoan.loanTerm) }, { headers: { 'x-auth-token': token } });
      setIsAddLoanOpen(false);
      setNewLoan({ borrowerId: '', loanSubject: '', principalAmount: '', interestRate: '', loanTerm: '', paymentSchedule: 'Monthly', issueDate: new Date() });
      fetchData();
    } catch (err) { console.error('Error adding loan:', err); }
  };
  
  const handleAddBorrower = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/borrowers', { name: newBorrower.name, contactInfo: newBorrower.contactInfo }, { headers: { 'x-auth-token': token } });
      setBorrowers(prev => [...prev, res.data]);
      setIsAddBorrowerOpen(false);
      setNewBorrower({ name: '', contactInfo: '' });
    } catch (err) { console.error('Error adding borrower:', err); }
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/loans/${selectedLoan._id}/installments/${newPayment.installment._id}`, { amountPaid: parseFloat(newPayment.amount) }, { headers: { 'x-auth-token': token } });
      setIsLogPaymentOpen(false);
      setIsViewPaymentsOpen(false);
      setNewPayment({ amount: '', installment: null });
      fetchData();
    } catch (err) { console.error('Error logging payment:', err); }
  };

 const handleEditLoan = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  try {
    // We now send only the data that is being changed.
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/loans/${editLoanData.id}`, 
      { loanSubject: editLoanData.loanSubject }, 
      { headers: { 'x-auth-token': token } }
    );
    setIsEditLoanOpen(false);
    fetchData(); // Refresh all data to show the change
  } catch (err) { 
    console.error('Error editing loan:', err); 
  }
};
const handleEditBorrower = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/borrowers/${editBorrowerData._id}`, 
      { name: editBorrowerData.name, contactInfo: editBorrowerData.contactInfo }, 
      { headers: { 'x-auth-token': token } }
    );
    setIsEditBorrowerOpen(false);
    fetchData(); // Refresh all data to show the changes
  } catch (err) { 
    console.error('Error editing borrower:', err); 
  }
};
  
  const handleDeleteLoan = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/loans/${selectedLoan._id}`, { headers: { 'x-auth-token': token } });
      fetchData();
      setIsDeleteLoanOpen(false);
      setSelectedLoan(null);
    } catch (err) { console.error("Failed to delete loan", err); }
  };
  
  const handleDeleteBorrower = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/borrowers/${selectedBorrower._id}`, { headers: { 'x-auth-token': token } });
      fetchData();
      setIsDeleteBorrowerOpen(false);
      setSelectedBorrower(null);
    } catch (err) { alert(err.response?.data?.msg || "Failed to delete borrower"); console.error("Failed to delete borrower", err); }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };
  
  const handleViewPayments = (loan) => {
  setSelectedLoan(loan);
  // The installment data is already inside the loan object, no need to fetch it again.
  setSelectedLoanPayments(loan.installments);
  setIsViewPaymentsOpen(true);
};

  const filteredLoans = useMemo(() => loans.filter(loan => loan.borrower.name.toLowerCase().includes(searchTerm.toLowerCase())), [loans, searchTerm]);
  const indexOfLastLoan = currentPage * loansPerPage;
const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
const totalPages = Math.ceil(filteredLoans.length / loansPerPage);
const indexOfLastBorrower = borrowerPage * borrowersPerPage;
const indexOfFirstBorrower = indexOfLastBorrower - borrowersPerPage;
const currentBorrowers = borrowers.slice(indexOfFirstBorrower, indexOfLastBorrower);
const totalBorrowerPages = Math.ceil(borrowers.length / borrowersPerPage);
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
  <div className="w-full p-4 md:p-8">
    <header className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold">Loan Manager</h1>
            <p className="text-muted-foreground">Manage and track all your loans efficiently</p>
        </div>
        <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>Log Out</Button>
            <Button onClick={() => setIsAddLoanOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">+ Add New Loan</Button>
        </div>
    </header>
    
    {/* --- NEW TWO-COLUMN LAYOUT START --- */}
    <main className="flex flex-col lg:flex-row gap-8 mt-6">
      
      {/* --- Left Column (Main Content) --- */}
      <div className="flex-grow flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Principal" value={`₱${stats.totalPrincipal.toLocaleString()}`} icon={<DollarSign size={20}/>} color="bg-blue-500"/>
            <StatCard title="Total Interest" value={`₱${stats.totalInterest.toLocaleString()}`} icon={<Percent size={20}/>} color="bg-emerald-500"/>
            <StatCard title="Total Collectibles" value={`₱${stats.totalCollectibles.toLocaleString()}`} icon={<Banknote size={20}/>} color="bg-purple-500"/>
           <StatCard 
  title="Active Loans" 
  value={stats.activeLoans} 
  icon={<Activity size={20}/>} 
  color="bg-orange-500"
  description={
    stats.overdueLoans > 0 
      ? <span className="text-red-500 font-semibold">{stats.overdueLoans} Overdue</span> 
      : 'All loans on track'
  }
/>
        </div>

        <div className="mb-4">
            <Input placeholder="Search for a borrower..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="max-w-sm"/>
        </div>
        
        <Card>
<CardHeader className="flex flex-row items-center justify-between">
  <div>
    <CardTitle>Loan Schedule</CardTitle>
    <CardDescription>An overview of all your active and completed loans.</CardDescription>
  </div>
  <div className="flex items-center space-x-2">
    <span className="text-sm text-muted-foreground">
      Page {currentPage} of {totalPages}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  </div>
</CardHeader>
            <CardContent>
                <Table>
<TableHeader>
  <TableRow>
    <TableHead className="w-[250px]">BORROWER</TableHead>
    <TableHead>PRINCIPAL</TableHead>
    <TableHead>INTEREST RATE</TableHead>
    <TableHead className="text-center">PROGRESS</TableHead>
    <TableHead className="text-center">NEXT DUE DATE</TableHead>
    <TableHead className="text-center">STATUS</TableHead>
    <TableHead className="text-right">ACTIONS</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {currentLoans.map(loan => (
    <TableRow key={loan._id}>
      {/* Borrower */}
      <TableCell>
        <div className="font-medium">{loan.borrower.name}</div>
        <div className="text-sm text-muted-foreground">{loan.loanSubject}</div>
      </TableCell>
      {/* Principal */}
      <TableCell>₱{loan.principalAmount.toLocaleString()}</TableCell>
      {/* Interest Rate */}
      <TableCell>{loan.interestRate}% per {loan.paymentSchedule.slice(0, -2)}</TableCell>
      {/* Progress Bar */}
      <TableCell>
        <div 
          className="cursor-pointer hover:opacity-80"
          onClick={() => handleViewPayments(loan)}
        >
          <Progress 
  value={(loan.installments.filter(i => i.status === 'Paid').length / loan.loanTerm) * 100} 
  className="w-full h-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-blue-500"
/>
          <div className="text-xs text-muted-foreground mt-1">
            {loan.installments.filter(i => i.status === 'Paid').length} of {loan.loanTerm} paid
          </div>
        </div>
      </TableCell>
      {/* Next Due Date */}
      <TableCell className="text-center">
        {(() => {
          const nextInstallment = loan.installments.find(inst => inst.status === 'Pending');
          if (nextInstallment) {
            return (
              <div>
                <div className="font-medium">{format(new Date(nextInstallment.dueDate), "MMM d, yyyy")}</div>
                <div className="text-xs text-muted-foreground">in {format(new Date(nextInstallment.dueDate), 'd')} days</div>
              </div>
            );
          }
          return <span className="text-sm text-muted-foreground">Paid in Full</span>;
        })()}
      </TableCell>
      {/* Status */}
      <TableCell className="text-center">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold
          ${loan.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
          ${loan.status === 'Overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
          ${loan.status === 'Completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
        `}>
          {loan.status}
        </span>
      </TableCell>
      {/* Actions */}
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => { setEditLoanData(loan); setIsEditLoanOpen(true); }}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => { setSelectedLoan(loan); setIsDeleteLoanOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      

      {/* --- Right Column (Sidebar) --- */}
    <div className="lg:w-1/3 lg:max-w-sm flex-shrink-0">
  <Card className="flex flex-col h-full"> {/* Added flex classes for footer */}
    <CardHeader>
      <CardTitle>Borrowers</CardTitle>
      <CardDescription>Manage all your borrowers.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2 flex-grow">
      {/* We are now mapping over currentBorrowers */}
      {currentBorrowers.map(b => (
        <div key={b._id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md dark:hover:bg-slate-800">
          <div>
            <div className="font-medium">{b.name}</div>
            <div className="text-sm text-muted-foreground">{b.contactInfo}</div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => { setEditBorrowerData(b); setIsEditBorrowerOpen(true); }}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setSelectedBorrower(b); setIsDeleteBorrowerOpen(true);}}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </CardContent>
    {/* --- NEW PAGINATION FOOTER --- */}
    <CardFooter className="flex justify-between items-center pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Page {borrowerPage} of {totalBorrowerPages}
      </span>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBorrowerPage(prev => Math.max(prev - 1, 1))}
          disabled={borrowerPage === 1}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBorrowerPage(prev => Math.min(prev + 1, totalBorrowerPages))}
          disabled={borrowerPage === totalBorrowerPages}
        >
          Next
        </Button>
      </div>
    </CardFooter>
  </Card>
</div>
    </main>
    {/* --- NEW LAYOUT END --- */}

    {/* --- ALL DIALOGS GO HERE --- */}
    <Dialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen}><DialogContent><DialogHeader><DialogTitle>Add New Loan</DialogTitle></DialogHeader><form onSubmit={handleAddLoan} className="space-y-4 py-4"><div className="space-y-2"><div className="flex items-center justify-between"><Label>Borrower</Label><Button variant="ghost" size="sm" type="button" onClick={() => setIsAddBorrowerOpen(true)}><PlusCircle className="h-4 w-4 mr-2"/>New Borrower</Button></div><Select onValueChange={(value) => setNewLoan({...newLoan, borrowerId: value})}><SelectTrigger><SelectValue placeholder="Select a borrower" /></SelectTrigger><SelectContent>{borrowers.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent></Select></div><Input placeholder="Loan Subject" value={newLoan.loanSubject} onChange={e => setNewLoan({...newLoan, loanSubject: e.target.value})} /><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !newLoan.issueDate && "text-muted-foreground")}>{newLoan.issueDate ? format(newLoan.issueDate, "PPP") : <span>Pick an issue date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newLoan.issueDate} onSelect={(date) => setNewLoan({...newLoan, issueDate: date})} initialFocus /></PopoverContent></Popover><Input placeholder="Principal (₱)" type="number" value={newLoan.principalAmount} onChange={e => setNewLoan({...newLoan, principalAmount: e.target.value})} /><Input placeholder="Interest (% per period)" type="number" value={newLoan.interestRate} onChange={e => setNewLoan({...newLoan, interestRate: e.target.value})} /><div className="flex gap-4"><Input placeholder="Term (e.g., 12)" type="number" value={newLoan.loanTerm} onChange={e => setNewLoan({...newLoan, loanTerm: e.target.value})} /><Select onValueChange={(value) => setNewLoan({...newLoan, paymentSchedule: value})} defaultValue="Monthly"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem></SelectContent></Select></div><DialogFooter><Button type="submit">Save Loan</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={isAddBorrowerOpen} onOpenChange={setIsAddBorrowerOpen}><DialogContent><DialogHeader><DialogTitle>Add New Borrower</DialogTitle></DialogHeader><form onSubmit={handleAddBorrower} className="space-y-4 py-4"><Input placeholder="Full Name" value={newBorrower.name} onChange={e => setNewBorrower({...newBorrower, name: e.target.value})} required/><Input placeholder="Contact Info (Email/Phone)" value={newBorrower.contactInfo} onChange={e => setNewBorrower({...newBorrower, contactInfo: e.target.value})} /><DialogFooter><Button type="submit">Save Borrower</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={isEditLoanOpen} onOpenChange={setIsEditLoanOpen}><DialogContent><DialogHeader><DialogTitle>Edit Loan</DialogTitle></DialogHeader><form onSubmit={handleEditLoan} className="space-y-4 py-4"><Label>Loan Subject</Label><Input value={editLoanData.loanSubject} onChange={e => setEditLoanData({...editLoanData, loanSubject: e.target.value})} /><DialogFooter><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={isViewPaymentsOpen} onOpenChange={setIsViewPaymentsOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Payment Schedule for {selectedLoan?.loanSubject}</DialogTitle><DialogDescription>Log payments for each installment.</DialogDescription></DialogHeader><div className="py-4 space-y-2 max-h-96 overflow-y-auto">{selectedLoan?.installments.map(inst => (<div key={inst._id} className={`flex items-center justify-between p-3 rounded-md ${inst.status === 'Paid' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}><div><span className="font-medium">{selectedLoan.paymentSchedule} {inst.installmentNumber}</span><div className="text-xs text-muted-foreground">Due: {format(new Date(inst.dueDate), "PPP")}</div></div>{inst.status === 'Paid' ? <span className="text-sm text-green-700 font-semibold">Paid: ₱{inst.amountPaid?.toLocaleString() || 'N/A'}</span> : <Button size="sm" variant="outline" onClick={() => { setNewPayment({ amount: inst.amountDue.toFixed(2), installment: inst }); setIsLogPaymentOpen(true); }}>Log Payment</Button>}</div>))}</div></DialogContent></Dialog>
    <Dialog open={isLogPaymentOpen} onOpenChange={setIsLogPaymentOpen}><DialogContent className="sm:max-w-[300px]"><DialogHeader><DialogTitle>Log Payment for {selectedLoan?.paymentSchedule} {newPayment.installment?.installmentNumber}</DialogTitle></DialogHeader><form onSubmit={handleLogPayment} className="space-y-4 py-4"><Input placeholder="Payment Amount (₱)" type="number" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} required/><DialogFooter><Button type="submit">Save Payment</Button></DialogFooter></form></DialogContent></Dialog>
    <AlertDialog open={isDeleteLoanOpen} onOpenChange={setIsDeleteLoanOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the loan for {selectedLoan?.borrower.name}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteLoan} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={isDeleteBorrowerOpen} onOpenChange={setIsDeleteBorrowerOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedBorrower?.name}. You cannot delete a borrower with active loans.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteBorrower} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={isEditBorrowerOpen} onOpenChange={setIsEditBorrowerOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Edit Borrower</DialogTitle></DialogHeader>
    {editBorrowerData && (
      <form onSubmit={handleEditBorrower} className="space-y-4 py-4">
        <Label>Full Name</Label>
        <Input 
          value={editBorrowerData.name} 
          onChange={e => setEditBorrowerData({...editBorrowerData, name: e.target.value})} 
        />
        <Label>Contact Info</Label>
        <Input 
          value={editBorrowerData.contactInfo} 
          onChange={e => setEditBorrowerData({...editBorrowerData, contactInfo: e.target.value})} 
        />
        <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
      </form>
    )}
  </DialogContent>
</Dialog>
  </div>
);

};

export default Dashboard;