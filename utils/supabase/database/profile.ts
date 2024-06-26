'use server'

import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '../server'
import { getToastRedirect } from '@/utils/helpers/helpers'
import { Database, Tables } from '@/db_types'
import { getDbUser } from '../auth-helpers/queries'
import { cache } from 'react'

export const updateHeader = async (formData: FormData) => {
  const supabase = createClient()
  const id = Number(formData.get('id')).valueOf()
  const title = String(formData.get('title')).trim()
  const pathname = String(formData.get('pathname')).trim()
  let redirectUrl: string

  const { error } = await supabase
    .from('headers')
    .update({ title })
    .eq('id', id)

  if (error) {
    redirectUrl = getToastRedirect(pathname, 'error', error.message)
  }

  redirectUrl = getToastRedirect(
    pathname,
    'status',
    'You are updated a header.'
  )

  return redirectUrl
}

export const createHeader = async (formData: FormData) => {
  const supabase = createClient()
  const title = String(formData.get('title')).trim()
  const pathname = String(formData.get('pathname')).trim()
  const dbProfile = (await getCurrentUserProfile(
    supabase
  )) as Tables<'profiles'>
  let redirectUrl: string

  const { error } = await supabase
    .from('headers')
    .insert({ title, profile_id: dbProfile?.id })

  if (error) {
    redirectUrl = getToastRedirect(pathname, 'error', error.message)
  }

  redirectUrl = getToastRedirect(pathname, 'status', 'You are added a header.')

  return redirectUrl
}

export const createProfileForUser = async (formData: FormData) => {
  const supabase = createClient()
  const title = String(formData.get('title')).trim()
  const description = String(formData.get('description')).trim()
  const picture = String(formData.get('profile_picture')).trim()
  const username = String(formData.get('username')).trim()
  const linkName = String(formData.get('linkName')).trim()
  const linkURL = String(formData.get('linkURL')).trim()
  const pathname = String(formData.get('pathname')).trim()

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      title,
      description,
      username,
      picture,
    })
    .select()

  if (error) {
    return getToastRedirect(pathname, 'error', error.message)
  } else if (data && data.length > 0) {
    const { data: data2, error } = await supabase
      .from('links')
      .insert({
        name: linkName,
        url: linkURL,
        profile_id: data[0].id,
        username,
      })
      .select()
    if (error) {
      return getToastRedirect(pathname, 'error', error.message)
    } else if (data2 && data2.length > 0) {
      await supabase
        .from('users')
        .update({ stepped: true })
        .eq('username', username)
      return getToastRedirect('/', 'status', 'Your page setup was successful.')
    } else {
      return getToastRedirect(
        pathname,
        'error',
        'You cloud be setup your page.'
      )
    }
  } else {
    return getToastRedirect(pathname, 'error', 'You cloud be setup your page.')
  }
}

export const getLinksByUserName = async (
  username: string,
  supabase: SupabaseClient<Database>
) => {
  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('username', username)
    .order('created_at')

  return data
}

export const getProfileByUserName = async (
  username: string,
  supabase: SupabaseClient<Database>
) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  return data
}

export const updateProfile = async (formData: FormData) => {
  const title = String(formData.get('title')).trim()
  const description = String(formData.get('description')).trim()
  const supabase = createClient()
  const resultToPath = '/dashboard/design'
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ title, description })
      .eq('user_id', user.id)
      .select()
    if (error) {
      return getToastRedirect(resultToPath, 'error', error.message)
    }
    if (data && data.length > 0) {
      return getToastRedirect(
        resultToPath,
        'status',
        'You are updated you page.'
      )
    }

    return getToastRedirect(
      resultToPath,
      'error',
      'You cloud be update profile.'
    )
  } else {
    return getToastRedirect(
      resultToPath,
      'error',
      'You cloud be update profile.'
    )
  }
}

export const deleteLink = async (formData: FormData) => {
  const id = String(formData.get('id'))
  const pathname = String(formData.get('pathname'))
  const supabase = createClient()
  const dbProfile = await getCurrentUserProfile(supabase)

  const { data, error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('profile_id', dbProfile!.id)
    .select()

  if (error) {
    return getToastRedirect(pathname, 'error', error.message)
  }

  if (data && data.length > 0) {
    return getToastRedirect(pathname, 'status', `成功删除${data.length}条链接`)
  }

  return getToastRedirect(pathname, 'error', '删除失败, 请稍后再试~')
}

export const updateLink = async (formData: FormData) => {
  const name = String(formData.get('name')).trim()
  const url = String(formData.get('url')).trim()
  const id = String(formData.get('id')).trim()
  const pathname = String(formData.get('pathname')).trim()
  const supabase = createClient()
  let redirectUrl: string

  const { error } = await supabase
    .from('links')
    .update({ name, url })
    .eq('id', id)

  if (error) {
    redirectUrl = getToastRedirect(pathname, 'error', error.message)
  }

  redirectUrl = getToastRedirect(pathname, 'status', 'You are updated a link.')

  return redirectUrl
}

export const removeLink = async (formData: FormData): Promise<string> => {
  let redirectUrl: string
  const supabase = createClient()
  const id = String(formData.get('linkId')).trim()
  const pathname = String(formData.get('pathname')).trim()
  const dbUser = await getDbUser(supabase)
  const currentProfile = await getCurrentUserProfile(supabase)
  if (!dbUser || !currentProfile) {
    redirectUrl = getToastRedirect(
      '/signin/password_signin',
      'error',
      '请先登录再进行操作'
    )
  } else {
    const { data, error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', dbUser.user_id)
      .eq('profile_id', currentProfile.id)
      .select()
    if (error) {
      redirectUrl = getToastRedirect(pathname, 'error', error.message)
    }

    if (data && data.length > 0) {
      redirectUrl = getToastRedirect(
        pathname,
        'status',
        `以成功删除${data.length}条数据`
      )
    }

    redirectUrl = getToastRedirect(pathname, 'error', '删除失败, 请稍后再试 :(')
  }

  return redirectUrl
}

export const addLink = async (formData: FormData) => {
  const name = String(formData.get('name')).trim()
  const url = String(formData.get('url')).trim()
  const pathname = String(formData.get('pathname')).trim()
  const supabase = createClient()
  const dbUser = await getDbUser(supabase)
  const dbProfile = await getCurrentUserProfile(supabase)
  if (dbUser && dbProfile) {
    const { data, error } = await supabase
      .from('links')
      .insert({
        name,
        url,
        username: dbUser.username,
        profile_id: dbProfile.id,
      })
      .select()
    if (error) {
      return getToastRedirect(pathname, 'error', error.message)
    }
    if (data && data.length > 0) {
      return getToastRedirect(pathname, 'status', '创建成功')
    }
  } else {
    await supabase.auth.signOut()
    return getToastRedirect(
      '/signin/password_signin',
      'error',
      '请先登录再进行操作'
    )
  }
  return getToastRedirect(pathname, 'error', '创建失败, 请稍后再试')
}

export const getHeadersForUser = cache(
  async (supabase: SupabaseClient<Database>) => {
    const dbUser: Tables<'users'> = (await getDbUser(
      supabase
    )) as Tables<'users'>
    const dbProfile: Tables<'profiles'> = (await getCurrentUserProfile(
      supabase
    )) as Tables<'profiles'>
    return (
      await supabase
        .from('headers')
        .select('*')
        .eq('profile_id', dbProfile.id)
        .eq('user_id', dbUser.user_id)
        .eq('hide', false)
    ).data
  }
)

export const getLinksForUser = async (supabase: SupabaseClient<Database>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const dbProfile = await getCurrentUserProfile(supabase)
  if (user && dbProfile) {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', dbProfile.id)
      .order('sort')
    return data
  }
  return null
}

const getCurrentUserProfile = async (supabase: SupabaseClient<Database>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return error ? null : data
}
