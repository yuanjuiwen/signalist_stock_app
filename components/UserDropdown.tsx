'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from 'lucide-react'
import Navitems from './Navitems'



const UserDropdown = () => {
  const router = useRouter();

  const handleSignOut = async() => {
    router.push("/sign-in")
  }

  const user = { name: 'John', email: 'wenkevin999@gmail.com'}


  return (
    <DropdownMenu>

        <DropdownMenuTrigger render={<Button variant="ghost"            className="flex h-auto py-1.5 items-center gap-3 text-gray-4 hover:text-yellow-500" />}>
            <Avatar className="h-8 w-8">
                <AvatarImage src="https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc5/Jensen-Huang-2.png" />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
                <span className='text-base font-medium text-gray-400'>
                    {user.name}
                </span>
            </div>

        </DropdownMenuTrigger>

       



        <DropdownMenuContent align="end" className=" w-72 text-gray-400">
            <DropdownMenuGroup>
                 <DropdownMenuLabel>
                    <div className="flex relative items-center gap-3 py-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc5/Jensen-Huang-2.png" />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <span className='text-base font-medium text-gray-400'>
                                {user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700"/>
                <DropdownMenuItem onClick={handleSignOut} className="text-gray-100 text-md font-m edium focus:bg-transparent focus-yellow-500 transition-colors cursor-pointer">
                   Logout
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700"/>
                <nav className="sm:hidden">
                    <Navitems/>
                </nav>

            </DropdownMenuGroup>
            
        </DropdownMenuContent>
    </DropdownMenu>
  )
}   

export default UserDropdown
