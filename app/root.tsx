import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';

import appStylesHref from './app.css';
import { createEmptyContact, getContacts } from './data';
import { useEffect } from 'react';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: appStylesHref },
];

export const loader = (async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const contacts = await getContacts(q);

  return json({ contacts, q });
}) satisfies LoaderFunction;

export const action = (async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}) satisfies ActionFunction;

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has('q');

  useEffect(() => {
    const searchField = document.getElementById('q');
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || '';
    }
  }, [q]);

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div id='sidebar'>
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id='search-form'
              role='search'
              onChange={(event) => {
                console.log(
                  '🚀 ~ App ~ event.currentTarget:',
                  event.currentTarget
                );
                submit(event.currentTarget);
              }}
            >
              <input
                id='q'
                aria-label='Search contacts'
                placeholder='Search'
                type='search'
                name='q'
                defaultValue={q || ''}
                className={searching ? 'loading' : ''}
              />
              <div id='search-spinner' aria-hidden hidden={!searching} />
            </Form>
            <Form method='post'>
              <button type='submit'>New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? 'active' : isPending ? 'pending' : ''
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{' '}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          id='detail'
          className={
            navigation.state === 'loading' && !searching ? 'loading' : ''
          }
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
