import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TokenDialogProps {
  mutate(...args: any[]): void;
}

export default function DialogDemo({ mutate }: TokenDialogProps) {
  const [token, setToken] = useState<string | undefined>(undefined);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Open AI Token</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Open AI Token</DialogTitle>
          <DialogDescription>
            In order to this app to work, you should set your Open AI Token.
            Don&apos;t worry, we will never store it anywhere else than your
            browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="name" className="text-right dark:text-white">
              Your Open AI Token
            </Label>
            <Input
              id="name"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => mutate(token)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
