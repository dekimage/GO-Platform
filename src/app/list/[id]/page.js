"use client";
import { observer } from "mobx-react";
import MobxStore from "@/mobx";

import { PodcastEmptyPlaceholder } from "@/reusable-ui/EmptyList";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TitleDescription } from "@/reusable-ui/TitleDescription";

const CustomListPage = observer(({ params }) => {
  const { lists, deleteList, editListName } = MobxStore;
  const [showDialog, setShowDialog] = useState(false);
  const [showEditListDialog, setShowEditListDialog] = useState(false);

  const listId = params.id;
  const list = lists.filter((list) => list.id === listId)[0];

  const [listName, setListName] = useState(list?.name || "New List");

  // const listTodos = findTodosByListId(listId);
  const listTodos = [];
  const onListNameChange = (e) => {
    setListName(e.target.value);
  };

  const router = useRouter();

  return (
    <div className="h-[90vh] m-4 sm:mx-8">
      <TitleDescription
        title={list?.name}
        button={
          <div>
            <Dialog
              open={showEditListDialog}
              onOpenChange={setShowEditListDialog}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="p-2 mr-2">
                    <HiOutlineCog6Tooth className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <DialogTrigger className="w-full flex">
                      Edit List
                    </DialogTrigger>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      deleteList(listId);
                      router.push("/");
                    }}
                  >
                    Delete List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit List Name</DialogTitle>
                  <DialogDescription>
                    Choose a name for your list.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      onChange={onListNameChange}
                      defaultValue={list?.name}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={listName === list?.name}
                    onClick={() => {
                      editListName(listId, listName);
                      setShowEditListDialog(false);
                    }}
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setShowDialog(true)}>
              <Plus size={16} className="mr-2" />
              Add Exercises
            </Button>
          </div>
        }
      />
      {!listTodos?.length && (
        <PodcastEmptyPlaceholder
          title="Your List is Empty"
          description="Add your first pathway to this list"
        >
          <Link href="/explore">
            <Button>
              <Plus size={16} className="mr-2" />
              Add Exercises
            </Button>
          </Link>
        </PodcastEmptyPlaceholder>
      )}
      <div className="flex flex-wrap gap-4">todos</div>
    </div>
  );
});

export default CustomListPage;
