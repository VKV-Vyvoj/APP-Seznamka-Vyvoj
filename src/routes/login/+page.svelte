<!-- src/routes/Login.svelte -->
<script>
    import { app, auth } from "../../firebase/Firebase"; // Upravte cestu podle svého projektu
    import { signInWithEmailAndPassword } from "firebase/auth";
    import Swal from "sweetalert2"; // Import SweetAlert2
  
    let email = "";
    let password = "";
  
    const loginUser = async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
  
        // Přihlášení proběhlo úspěšně, zobrazit SweetAlert notifikaci
        Swal.fire({
          icon: "success",
          title: "Přihlášení proběhlo úspěšně!",
          text: "Budete přesměrováni na svůj účet za 5 sekundy.",
          showConfirmButton: false,
          timer: 5000,
        }).then(() => {
          // Po uplynutí 5 sekund přesměrování na stránku /account (přizpůsobte podle vašich potřeb)
          window.location.href = "/account";
        });
      } catch (error) {
        console.error("Chyba při přihlašování:", error);
      }
    };
  </script>
  
  <div class="h-screen w-full">
    <div class="bg-gray-800 h-screen mx-auto max-w-md">
      <div class="p-12">
        <p class="text-center text-5xl pt-10 text-yellow-500 font-bold">
          Vítejte zpět!
        </p>
        <p class="text-center text-xl py-3 text-gray-400 font-semibold">Pro přihlášení vyplň údaje</p>
      </div>
      <div class="mx-12 p-3 rounded-xl shadow-sm bg-gray-900">
        <div class="p-3 mx-6 border-b border-gray-500">
          <input placeholder="Tvůj email" bind:value={email} class="bg-transparent text-yellow-500 w-full focus:outline-none focus:ring" type="email" />
        </div>
        <div class="p-3 mx-6 flex border-b border-gray-500">
          <input placeholder="Tvoje heslo" bind:value={password} class="bg-transparent text-yellow-500 focus:outline-none focus:ring w-full" type="password" />
        </div>
      </div>
      <div class="mx-12 p-3 justify-between flex">
        <div class="flex">
          <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">           
          </div>
        </div>
      </div>
      <div class="w-full p-12">
        <button on:click={loginUser} class="bg-yellow-500 p-3 rounded-3xl w-full h-full hover:bg-yellow-600">Přihlásit se</button>
        <p class="mx-auto text-center mt-3 text-gray-400">Nemáte účet?  <a href="/register" class="text-md font-semibold">Zaregistruj se</a> </p>
      </div>
    </div>
  </div>
  