import { ActionFunction, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { deleteContact } from '~/data';

export const action = (async ({ params }) => {
  invariant(params.contactId, 'Missing contactId param');
  await deleteContact(params.contactId);
  return redirect('/');
}) satisfies ActionFunction;
