'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Input } from '../Input/Input'
import { Modal } from '../Modal/Modal'
import { useRef, useState } from 'react'
import { addLink } from '@/utils/supabase/database/profile'
import { Loader } from '../Loader/Loader'
import { handleRequest } from '@/utils/supabase/auth-helpers/client'
import { Button } from '../Buttons/Button'

export const AddLink: React.FC = () => {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    await handleRequest(e, addLink, router)
    setIsLoading(false)
    setIsOpenModal(false)
    formRef.current?.reset()
  }

  return (
    <>
      <div className="grid grid-flow-col gap-x-2 ">
        <button
          className="oml-bg oml-btn text-white rounded flex justify-center items-center"
          onClick={() => setIsOpenModal(true)}
        >
          ADD LINK
        </button>
        <button className="bg-[--primary-color] text-white rounded flex justify-center items-center font-semibold">
          ADD EMBED
        </button>
      </div>
      <Modal
        title="Add"
        visible={isOpenModal}
        onClose={() => setIsOpenModal(false)}
      >
        <form
          onSubmit={handleSubmit}
          ref={formRef}
          action="POST"
          className="flex flex-col items-stretch gap-y-4"
        >
          <Input name="name" placeholder="Title" required autoComplete="off" />
          <Input name="url" placeholder="URL" required autoComplete="off" />
          <Input
            type="hidden"
            name="pathname"
            placeholder="URL"
            defaultValue={usePathname()}
          />
          <Button type="submit" disabled={isLoading}>
            保存
          </Button>
        </form>
      </Modal>
    </>
  )
}
