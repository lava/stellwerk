import { fail, redirect } from '@sveltejs/kit';
import { VotingMachine } from '../lib/voting-machine';
import type { PageServerLoad, Actions } from './$types';

const vm = new VotingMachine();


export const load =  ( async  ({ cookies })  => {
    const user = cookies.get('user');
    if (!user) {
        throw redirect(302, '/login');
    } else {
        throw redirect(302, '/chooser');
    }
}) satisfies PageServerLoad;

export const actions = {

    vote: async ({ request, cookies }) => {
        const user = cookies.get('user');
        const form_data = await request.formData();
        const choice = form_data.get('choice');
        const selected = form_data.get('selected');
        if (!user || !choice) {
            return fail(400, { error: 'User or choice not set' });
        }
        if (selected) {
            await vm.vote(user, choice as string);
        } else {
            await vm.unvote(user, choice as string);
        }
        
    },

} satisfies Actions;
